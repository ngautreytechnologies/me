// ----- Globals -----
import './globals';

// ----- Core Modules -----
import './modules/logging/logger';
import './modules/pipeline/request-pipeline';
import './modules/http/http-client';
import './modules/enrichment/environment';
import './modules/enrichment/timestamp';
import './modules/hooks/global';
import './modules/hooks/component';
import './modules/dom/dom';
import './modules/dom/navigation';
import './modules/animation/animation';
import './modules/reactivity/reactive';
import './modules/reactivity/signals';
import './modules/reactivity/signal-store';
import './modules/reactivity/event-hub';
import './modules/cache/cache';
import './modules/enrichment/enrichment';
import './modules/http/http';
import './modules/privacy/privacy';
import './modules/resilience/resilience';
import './modules/security/security';
import './modules/storage/storage';
import './modules/transformation/transformation';

// ----- Styles -----
import './styles/styles'

// ----- Components -----
// Base components first
import './components/base-component';
import './components/base-light-component';
import './components/base-shadow-component';

// Feature components
import './components/header/header';
import './components/summary/summary';
import './components/certifications/certifications';
import './components/education/education';
import './components/experience/experience';

// Skills
import './components/skills/data';
import './components/skills/skill-details/skill-details';
import './components/skills/skills-grid/skills-grid';

// Portfolio
import './components/portfolio/data';
import './components/portfolio/ui/portfolio-details/portfolio-details';
import './components/portfolio/ui/portfolio-filter/portfolio-filter';
import './components/portfolio/ui/portfolio-list/portfolio-list';
import './components/portfolio/services/github';
import './components/portfolio/domain/project/project';
import './components/portfolio/domain/topic/taxonomy';
import './components/portfolio/domain/topic/topic';
