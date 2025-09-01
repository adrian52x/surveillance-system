import { 
  getAllClasses, 
  isValidClass, 
  getClassCount, 
  searchClasses, 
  getClassesByCategory 
} from './coco-classes.js';

// Test the COCO classes functionality
console.log('=== COCO-SSD Model Classes Information ===\n');

console.log(`Total number of detectable classes: ${getClassCount()}\n`);

console.log('All available classes:');
console.log(getAllClasses().join(', '));
console.log('\n');

console.log('Classes organized by category:');
const categories = getClassesByCategory();
Object.entries(categories).forEach(([category, classes]) => {
  console.log(`${category.toUpperCase()}: ${classes.join(', ')}`);
});
console.log('\n');

console.log('Search examples:');
console.log(`Classes containing "ball": ${searchClasses('ball').join(', ')}`);
console.log(`Classes containing "phone": ${searchClasses('phone').join(', ')}`);
console.log(`Classes containing "dog": ${searchClasses('dog').join(', ')}`);
console.log('\n');

console.log('Validation examples:');
console.log(`Is "person" a valid class? ${isValidClass('person')}`);
console.log(`Is "robot" a valid class? ${isValidClass('robot')}`);
console.log(`Is "car" a valid class? ${isValidClass('car')}`);
