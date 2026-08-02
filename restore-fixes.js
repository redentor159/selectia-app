const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/views/overview-view.tsx', 'utf8');

// 1. Remove ConsultorView import
content = content.replace(/import \{ ConsultorView \} from "\.\/consultor-view";\n/, '');

// 2. Remove ConsultorOverview function completely
content = content.replace(/function ConsultorOverview\(\) \{\s*return <ConsultorView \/>;\s*\}/, '');

// 3. Remove LicenseBadge import and usage
content = content.replace(/import \{ LicenseBadge \} from "\.\.\/model-badges";\n/, '');
content = content.replace(/<LicenseBadge license=\{model\.license\} licenseName=\{model\.licenseName\} \/>\n?\s*/g, '');

// 4. Update Inteligencia vs Precio Legend
const oldLegend = `<div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">\n                  <div className="flex items-center gap-1.5">\n                    <div className="w-2 h-2 rounded-full bg-[var(--text-primary)]" />\n                    <span>Pago</span>\n                  </div>\n                  <div className="flex items-center gap-1.5">\n                    <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />\n                    <span>Gratis</span>\n                  </div>\n                </div>`;
const newLegend = `<ScatterProviderLegend data={allProvidersData} activeProviders={activeProviders} onToggle={toggleProvider} />`;
content = content.replace(oldLegend, '');
// Insert newLegend after the div that contains the title
content = content.replace(/(<CardTitle[^>]*>\n\s*Inteligencia vs Precio\n\s*<\/CardTitle>\n\s*<CardDescription[^>]*>[^<]*<\/CardDescription>\n\s*<\/div>)\n\s*<\/div>/, '$1\n              </div>\n              ' + newLegend);

// 5. Update Point cell color in Inteligencia vs Precio
content = content.replace(/fill=\{entry\.free \? "var\(--color-success\)" : "var\(--text-primary\)"\}/g, 'fill={entry.color} opacity={getPointOpacity(entry.provider)}');


fs.writeFileSync('src/components/dashboard/views/overview-view.tsx', content);
console.log('Restored prior state fixes for overview-view');
