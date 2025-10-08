package cmd

import "github.com/spf13/cobra"

var importPathsCmd = &cobra.Command{
    Use:   "import-paths",
    Short: "Manage and analyze import paths",
}

func init() {
    importPathsCmd.AddCommand(importScanCmd)
    importPathsCmd.AddCommand(importValidateCmd)
    importPathsCmd.AddCommand(importGenerateCmd)
}
