/**
 * Utility functions to handle encoded characters from WordPress imports
 */

/**
 * Decodes HTML entities and common WordPress encoded characters
 * @param text - The text that may contain encoded characters
 * @returns Decoded text
 */
export function decodeHtmlEntities(text: string | null | undefined): string {
  if (!text) return '';
  
  // Create a temporary DOM element to decode HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  let decoded = textarea.value;
  
  // Handle common WordPress encoded characters that might not be caught by innerHTML
  const decodingMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&#8217;': "'", // Right single quotation mark
    '&#8216;': "'", // Left single quotation mark
    '&#8220;': '"', // Left double quotation mark
    '&#8221;': '"', // Right double quotation mark
    '&#8211;': '–', // En dash
    '&#8212;': '—', // Em dash
    '&#8230;': '…', // Horizontal ellipsis
    '&nbsp;': ' ',
    '&aacute;': 'á',
    '&eacute;': 'é',
    '&iacute;': 'í',
    '&oacute;': 'ó',
    '&uacute;': 'ú',
    '&Aacute;': 'Á',
    '&Eacute;': 'É',
    '&Iacute;': 'Í',
    '&Oacute;': 'Ó',
    '&Uacute;': 'Ú',
    '&ntilde;': 'ñ',
    '&Ntilde;': 'Ñ',
    '&ccedil;': 'ç',
    '&Ccedil;': 'Ç',
    '&uuml;': 'ü',
    '&Uuml;': 'Ü',
  };
  
  // Apply manual decoding for any remaining entities
  Object.entries(decodingMap).forEach(([encoded, decoded_char]) => {
    decoded = decoded.replace(new RegExp(encoded, 'g'), decoded_char);
  });
  
  // Handle numeric character references (&#xxx;)
  decoded = decoded.replace(/&#(\d+);/g, (_, dec) => {
    return String.fromCharCode(parseInt(dec, 10));
  });
  
  // Handle hexadecimal character references (&#xXX;)
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  
  return decoded.trim();
}

/**
 * Decodes text that may contain URL-encoded characters
 * @param text - The text that may contain URL-encoded characters
 * @returns Decoded text
 */
export function decodeUrlEncoded(text: string | null | undefined): string {
  if (!text) return '';
  
  try {
    return decodeURIComponent(text);
  } catch (error) {
    // If decoding fails, return the original text    return text;
  }
}

/**
 * Comprehensive text decoding that handles both HTML entities and URL encoding
 * @param text - The text that may contain various types of encoding
 * @returns Fully decoded text
 */
export function decodeText(text: string | null | undefined): string {
  if (!text) return '';
  
  // First decode HTML entities, then URL encoding
  let decoded = decodeHtmlEntities(text);
  decoded = decodeUrlEncoded(decoded);
  
  return decoded;
}

/**
 * Cleans and decodes member data that may contain encoded characters
 * @param member - Member object that may contain encoded text
 * @returns Member object with decoded text fields
 */
export function cleanMemberData<T extends Record<string, any>>(member: T): T {
  const cleanedMember = { ...member } as any;
  
  // Fields that commonly contain encoded text
  const textFields = [
    'firstName', 'first_name',
    'lastName', 'last_name', 
    'displayName', 'display_name',
    'company',
    'bio', 'biography',
    'mainProfession', 'main_profession',
    'professionalRole', 'professional_role',
    'position',
    'location',
    'city',
    'region',
    'country',
    'province',
    'autonomous_community'
  ];
  
  // Clean text fields
  textFields.forEach(field => {
    if (cleanedMember[field] && typeof cleanedMember[field] === 'string') {
      (cleanedMember as any)[field] = decodeText(cleanedMember[field]);
    }
  });
  
  // Clean arrays of strings (like specializations, responsibilities)
  const arrayFields = [
    'specializations',
    'responsibilities', 
    'otherProfessions', 
    'other_professions',
    'previousPositions'
  ];
  
  arrayFields.forEach(field => {
    if (Array.isArray(cleanedMember[field])) {
      (cleanedMember as any)[field] = cleanedMember[field].map((item: any) => {
        if (typeof item === 'string') {
          return decodeText(item);
        }
        if (typeof item === 'object' && item !== null) {
          return cleanMemberData(item);
        }
        return item;
      });
    }
  });
  
  // Clean nested objects (like location, socialMedia)
  const objectFields = ['location', 'socialMedia', 'social_media'];
  
  objectFields.forEach(field => {
    if (cleanedMember[field] && typeof cleanedMember[field] === 'object') {
      (cleanedMember as any)[field] = cleanMemberData(cleanedMember[field]);
    }
  });
  
  return cleanedMember;
}