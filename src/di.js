import { GitHubService } from "./components/portfolio/instruments/services/github";

export function buildDiContainer(params) {

    // Register Instruments (low-level dependencies)
    container.registerClass('GitHubService', GitHubService, 'singleton');

    // Example of resolving and using the composer
    // const portfolioComposer = container.resolve('PortfolioComposer');

    // portfolioComposer.compose();

}