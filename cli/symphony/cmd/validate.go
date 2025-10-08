package cmd

import "github.com/spf13/cobra"

var importValidateCmd = &cobra.Command{
    Use:   "validate",
    Short: "Validate project import paths",
    Run: func(cmd *cobra.Command, args []string) {
        cmd.Help()
    },
}
