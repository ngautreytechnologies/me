package cmd

import "github.com/spf13/cobra"

var workflowCmd = &cobra.Command{
    Use:   "workflow",
    Short: "Placeholder for workflow execution",
    Run: func(cmd *cobra.Command, args []string) {
        cmd.Help()
    },
}
