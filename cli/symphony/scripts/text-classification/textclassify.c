// bin/textclassify.c
// Compile: gcc -O3 -std=c11 -march=native -o bin/textclassify bin/textclassify.c
// Usage: ./bin/textclassify -m models/model.tsv < input.txt > output.jsonl

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <errno.h>

#define MAX_LABELS 512
#define INITIAL_KW_CAP 256
#define TOKEN_MAX 256
#define LINE_BUF 8192

typedef struct
{
    char *kw;
    double w;
} KW;
typedef struct
{
    char *label;
    KW *kws;
    size_t kw_count;
    size_t kw_cap;
} Label;

static char *strdup_(const char *s)
{
    if (!s)
        return NULL;
    size_t n = strlen(s);
    char *r = malloc(n + 1);
    if (!r)
    {
        perror("malloc");
        exit(1);
    }
    memcpy(r, s, n + 1);
    return r;
}

static void to_lower_inplace(char *s)
{
    for (; *s; ++s)
        *s = tolower((unsigned char)*s);
}

static int kw_cmp(const void *a, const void *b)
{
    const KW *A = a, *B = b;
    return strcmp(A->kw, B->kw);
}

static double lookup_kw(const Label *L, const char *tok)
{
    size_t lo = 0, hi = L->kw_count;
    while (lo < hi)
    {
        size_t mid = (lo + hi) >> 1;
        int c = strcmp(L->kws[mid].kw, tok);
        if (c == 0)
            return L->kws[mid].w;
        if (c < 0)
            lo = mid + 1;
        else
            hi = mid;
    }
    return 0.0;
}

static void usage(const char *prog)
{
    fprintf(stderr, "Usage: %s -m model.tsv\n", prog);
    fprintf(stderr, "Reads lines from stdin, outputs JSONL to stdout.\n");
}

// safe JSON string escape for ASCII control and quotes/backslashes
static void json_escape_print(const char *s)
{
    for (; *s; ++s)
    {
        unsigned char c = (unsigned char)*s;
        if (c == '\\' || c == '"')
        {
            putchar('\\');
            putchar(c);
        }
        else if (c == '\b')
            printf("\\b");
        else if (c == '\f')
            printf("\\f");
        else if (c == '\n')
            printf("\\n");
        else if (c == '\r')
            printf("\\r");
        else if (c == '\t')
            printf("\\t");
        else if (c < 0x20)
            printf("\\u%04x", c);
        else
            putchar(c);
    }
}

int main(int argc, char **argv)
{
    char *model_path = NULL;
    if (argc < 2)
    {
        usage(argv[0]);
        return 2;
    }
    for (int i = 1; i < argc; ++i)
    {
        if ((strcmp(argv[i], "-m") == 0 || strcmp(argv[i], "--model") == 0) && i + 1 < argc)
        {
            model_path = argv[++i];
        }
        else
        {
            fprintf(stderr, "Unknown arg: %s\n", argv[i]);
            usage(argv[0]);
            return 2;
        }
    }
    if (!model_path)
    {
        usage(argv[0]);
        return 2;
    }

    FILE *mf = fopen(model_path, "r");
    if (!mf)
    {
        fprintf(stderr, "Failed to open model '%s': %s\n", model_path, strerror(errno));
        return 1;
    }

    Label labels[MAX_LABELS];
    size_t label_count = 0;
    memset(labels, 0, sizeof(labels));

    char line[LINE_BUF];
    while (fgets(line, sizeof line, mf))
    {
        // trim newline
        size_t ln = strlen(line);
        while (ln && (line[ln - 1] == '\n' || line[ln - 1] == '\r'))
            line[--ln] = 0;
        if (ln == 0)
            continue;
        // expect: label<TAB>keyword<TAB>weight
        char *lab = strtok(line, "\t");
        char *kw = strtok(NULL, "\t");
        char *wstr = strtok(NULL, "\t");
        if (!lab || !kw || !wstr)
            continue;
        double w = atof(wstr);
        to_lower_inplace(kw);

        // find or create label
        int idx = -1;
        for (size_t i = 0; i < label_count; i++)
            if (strcmp(labels[i].label, lab) == 0)
            {
                idx = i;
                break;
            }
        if (idx < 0)
        {
            if (label_count >= MAX_LABELS)
            {
                fprintf(stderr, "too many labels\n");
                exit(1);
            }
            labels[label_count].label = strdup_(lab);
            labels[label_count].kw_cap = INITIAL_KW_CAP;
            labels[label_count].kws = malloc(sizeof(KW) * labels[label_count].kw_cap);
            labels[label_count].kw_count = 0;
            idx = label_count++;
        }
        Label *L = &labels[idx];
        if (L->kw_count >= L->kw_cap)
        {
            L->kw_cap *= 2;
            L->kws = realloc(L->kws, sizeof(KW) * L->kw_cap);
            if (!L->kws)
            {
                perror("realloc");
                exit(1);
            }
        }
        L->kws[L->kw_count].kw = strdup_(kw);
        L->kws[L->kw_count].w = w;
        L->kw_count++;
    }
    fclose(mf);

    // sort keywords per label for binary search
    for (size_t i = 0; i < label_count; i++)
    {
        qsort(labels[i].kws, labels[i].kw_count, sizeof(KW), kw_cmp);
    }

    // streaming classify
    while (fgets(line, sizeof line, stdin))
    {
        size_t ln = strlen(line);
        while (ln && (line[ln - 1] == '\n' || line[ln - 1] == '\r'))
            line[--ln] = 0;

        // prepare scores
        double scores[MAX_LABELS];
        for (size_t i = 0; i < label_count; i++)
            scores[i] = 0.0;

        // tokenize ASCII-wise
        char token[TOKEN_MAX];
        size_t ti = 0;
        for (size_t i = 0; i <= ln; i++)
        {
            unsigned char c = (i < ln) ? (unsigned char)line[i] : 0;
            int delim = (c == 0) || isspace(c) || ispunct(c);
            if (!delim)
            {
                if (ti + 1 < TOKEN_MAX)
                    token[ti++] = tolower(c);
            }
            else
            {
                if (ti > 0)
                {
                    token[ti] = 0;
                    for (size_t li = 0; li < label_count; li++)
                    {
                        scores[li] += lookup_kw(&labels[li], token);
                    }
                    ti = 0;
                }
            }
        }

        // pick best
        size_t besti = 0;
        double best = scores[0];
        for (size_t li = 1; li < label_count; li++)
        {
            if (scores[li] > best)
            {
                best = scores[li];
                besti = li;
            }
        }

        // emit JSONL
        printf("{\"text\":\"");
        json_escape_print(line);
        printf("\",\"label\":\"%s\",\"scores\":{", labels[besti].label);
        for (size_t li = 0; li < label_count; li++)
        {
            printf("\"%s\":%.6f", labels[li].label, scores[li]);
            if (li + 1 < label_count)
                putchar(',');
        }
        printf("}}\n");
    }

    // cleanup
    for (size_t i = 0; i < label_count; i++)
    {
        free(labels[i].label);
        for (size_t k = 0; k < labels[i].kw_count; k++)
            free(labels[i].kws[k].kw);
        free(labels[i].kws);
    }

    return 0;
}
