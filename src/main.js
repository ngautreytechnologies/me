async function mountComponent(id, path) {
    const mount = document.getElementById(id);
    if (!mount) return;

    const res = await fetch(path);

    if (!res.ok) {
        mount.innerHTML = `<p class="muted">Component failed to load.</p>`;
        return;
    }

    mount.innerHTML = await res.text();
}

async function boot() {
    await mountComponent("cv-header", "components/header/header.html");
    await mountComponent("core-skills", "components/skills/skills.html");
    await mountComponent("career-highlights", "components/highlights/highlights.html");
    await mountComponent("strategic-impact", "components/impact/impact.html");
    await mountComponent("projects", "components/projects/projects.html");
    await mountComponent("experience", "components/experience/experience.html");
    await mountComponent("education", "components/education/education.html");
    await mountComponent("certifications", "components/certifications/certifications.html");
    await mountComponent("footer", "components/footer/footer.html");
}

boot();
