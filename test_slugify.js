// Test slug generation
const slugify = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Test cases
const testCases = [
  'prenez rendez-vous',
  'My Awesome Page',
  'Test  Multiple   Spaces',
  'Special!@#$%Characters',
  'Français Accénts',
  'home',
  '  Leading and trailing spaces  ',
  'UPPERCASE TEXT',
];

console.log('Slug Generation Tests:');
console.log('='.repeat(50));
testCases.forEach(input => {
  const output = slugify(input);
  console.log(`Input:  "${input}"`);
  console.log(`Output: "${output}"`);
  console.log('-'.repeat(50));
});
