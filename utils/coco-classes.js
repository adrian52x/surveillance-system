// COCO-SSD Model Classes
// The COCO-SSD model can detect 80 different object classes from the COCO dataset

export const COCO_CLASSES = [
  'person',
  'bicycle',
  'car',
  'motorcycle',
  'airplane',
  'bus',
  'train',
  'truck',
  'boat',
  'traffic light',
  'fire hydrant',
  'stop sign',
  'parking meter',
  'bench',
  'bird',
  'cat',
  'dog',
  'horse',
  'sheep',
  'cow',
  'elephant',
  'bear',
  'zebra',
  'giraffe',
  'backpack',
  'umbrella',
  'handbag',
  'tie',
  'suitcase',
  'frisbee',
  'skis',
  'snowboard',
  'sports ball',
  'kite',
  'baseball bat',
  'baseball glove',
  'skateboard',
  'surfboard',
  'tennis racket',
  'bottle',
  'wine glass',
  'cup',
  'fork',
  'knife',
  'spoon',
  'bowl',
  'banana',
  'apple',
  'sandwich',
  'orange',
  'broccoli',
  'carrot',
  'hot dog',
  'pizza',
  'donut',
  'cake',
  'chair',
  'couch',
  'potted plant',
  'bed',
  'dining table',
  'toilet',
  'tv',
  'laptop',
  'mouse',
  'remote',
  'keyboard',
  'cell phone',
  'microwave',
  'oven',
  'toaster',
  'sink',
  'refrigerator',
  'book',
  'clock',
  'vase',
  'scissors',
  'teddy bear',
  'hair drier',
  'toothbrush'
];

// Function to get all classes
export const getAllClasses = () => COCO_CLASSES;

// Function to check if a class exists
export const isValidClass = (className) => COCO_CLASSES.includes(className);

// Function to get class count
export const getClassCount = () => COCO_CLASSES.length;

// Function to search for classes containing a keyword
export const searchClasses = (keyword) => {
  return COCO_CLASSES.filter(className => 
    className.toLowerCase().includes(keyword.toLowerCase())
  );
};

// Function to get classes by category (rough categorization)
export const getClassesByCategory = () => {
  return {
    people: ['person'],
    vehicles: ['bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat'],
    animals: ['bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'],
    food: ['banana', 'apple', 'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake'],
    furniture: ['chair', 'couch', 'bed', 'dining table'],
    electronics: ['tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'refrigerator'],
    sports: ['frisbee', 'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket'],
    kitchenware: ['bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl'],
    accessories: ['backpack', 'umbrella', 'handbag', 'tie', 'suitcase'],
    household: ['book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush', 'potted plant', 'toilet', 'sink'],
    outdoor: ['traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench']
  };
};

console.log('COCO-SSD Model can detect', getClassCount(), 'different object classes:');
console.log(getAllClasses());
