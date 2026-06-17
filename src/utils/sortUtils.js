export const getSortPriority = (unit) => {
  const lowerUnit = (unit || '').toLowerCase();
  switch(lowerUnit) {
    case '250ml': return 1;
    case '600ml': return 2;
    case '2l': return 3;
    case '150ml': return 4;
    case '200ml': return 5;
    default: return 6;
  }
};

const extractSize = (item) => {
  if (item.size) return item.size;
  const match = item.name && item.name.match(/(\d+(?:\.\d+)?\s*[a-zA-Z]+)$/);
  return match ? match[1] : (item.unit !== 'Cases' ? item.unit : '');
};

export const sortBillItems = (a, b) => {
  const aUnit = (extractSize(a) || '').toLowerCase();
  const bUnit = (extractSize(b) || '').toLowerCase();
  
  const aPriority = getSortPriority(aUnit);
  const bPriority = getSortPriority(bUnit);

  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }
  
  if (aPriority === 6 && bPriority === 6) {
    const aIsMl = aUnit.toLowerCase().includes('ml');
    const bIsMl = bUnit.toLowerCase().includes('ml');
    if (aIsMl && !bIsMl) return -1;
    if (!aIsMl && bIsMl) return 1;
    
    const aNum = parseInt(aUnit);
    const bNum = parseInt(bUnit);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      const sizeDiff = aNum - bNum;
      if (sizeDiff !== 0) return sizeDiff;
    }
  }
  
  // Return 0 to maintain insertion order if sizes are the same, no alphabetical sort
  return 0;
};

export const sortSizes = (a, b) => {
  const aPriority = getSortPriority(a);
  const bPriority = getSortPriority(b);

  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }
  
  if (aPriority === 6 && bPriority === 6) {
    const aIsMl = (a || '').toLowerCase().includes('ml');
    const bIsMl = (b || '').toLowerCase().includes('ml');
    if (aIsMl && !bIsMl) return -1;
    if (!aIsMl && bIsMl) return 1;
    
    const aNum = parseInt(a);
    const bNum = parseInt(b);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return aNum - bNum;
    }
  }
  return 0;
};
