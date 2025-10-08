// ---------------------------------------------
// Portfolio Component Index
// ---------------------------------------------
// One import to register all portfolio-related modules
// ---------------------------------------------
// ===== Composer =====
import './composers/portfolio-composer.js';

// ===== Data =====
import './data.js';

// ===== Domain Models =====
import './instruments/domain/project.js';
import './instruments/domain/taxonomy.js';
import './instruments/domain/topic.js';

// ===== Services =====
import './instruments/services/github.js';

// ===== Orchestrator =====
import './orchestrators/portfolio-orchestrator.js';

// ===== Views (Performances) =====
import './performances/views/project-card-view.js';
import './performances/views/project-details-view.js';
import './performances/views/project-list-view.js';

// ===== UI Components (Stages) =====
import './stages/components/portfolio-details.js';
import './stages/components/portfolio-filter.js';
import './stages/components/portfolio-list.js';
