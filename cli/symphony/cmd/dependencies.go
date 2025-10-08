package cmd

import "github.com/spf13/cobra"

var dependenciesCmd = &cobra.Command{
    Use:   "dependencies",
    Short: "Manage project dependencies",
}

func init() {
    dependenciesCmd.AddCommand(importPathsCmd)
}
