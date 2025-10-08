package cmd

import "github.com/spf13/cobra"

var importGenerateCmd = &cobra.Command{
    Use:   "generate",
    Short: "Generate index.js from project structure",
    Run: func(cmd *cobra.Command, args []string) {
        cmd.Help()
    },
}
