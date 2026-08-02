const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  
  // Replace <Card> with flex flex-col if inside the charts section
  // Actually, we can just replace <CardContent> with <CardContent className="flex-1 min-h-[300px]"> 
  // and <ResponsiveContainer height={300} ...> with height="100%"
  
  content = content.replace(/<Card className="([^"]+)">/g, (match, classes) => {
    if (!classes.includes('flex flex-col')) {
      return `<Card className="${classes} flex flex-col">`;
    }
    return match;
  });

  content = content.replace(/<CardContent>/g, '<CardContent className="flex-1 min-h-[300px]">');
  content = content.replace(/height=\{300\}/g, 'height="100%"');
  content = content.replace(/height=\{320\}/g, 'height="100%"');

  // Fix the first table CardContent which we shouldn't have touched
  content = content.replace(/<CardContent className="flex-1 min-h-\[300px\]" className="overflow-x-auto">/g, '<CardContent className="overflow-x-auto">');

  fs.writeFileSync(filepath, content);
  console.log('Patched ' + filepath);
}

patchFile('src/components/dashboard/views/analytics-view.tsx');
