export const generateReferralCode = (name: string): string => {
    // Convert name to uppercase and remove spaces
    const base = name.toUpperCase().replace(/\s/g, '');
    
    // Generate random 4-digit number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    // Combine and take first 6 characters if needed
    return `${base}${randomNum}`.slice(0, 10);
  };