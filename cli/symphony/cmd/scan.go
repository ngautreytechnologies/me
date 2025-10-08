package cmd

import "github.com/spf13/cobra"

var importScanCmd = &cobra.Command{
    Use:   "scan",
    Short: "Scan project import paths",
    Run: func(cmd *cobra.Command, args []string) {
        cmd.Help()
    },
}
