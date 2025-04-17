
// Utility functions for formatting values

// Currency formatter
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Date formatter
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Number formatter with fixed decimal places
export const formatNumber = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Phone formatter
export const formatPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format according to Brazilian phone number pattern
  if (cleaned.length === 11) {
    // Mobile with DDD: (XX) XXXXX-XXXX
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
  } else if (cleaned.length === 10) {
    // Landline with DDD: (XX) XXXX-XXXX
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}`;
  } else {
    return phone;
  }
};

// Format CNPJ
export const formatCnpj = (cnpj: string): string => {
  if (!cnpj) return '';
  
  // Remove non-numeric characters
  const cleaned = cnpj.replace(/\D/g, '');
  
  // Format: XX.XXX.XXX/XXXX-XX
  if (cleaned.length === 14) {
    return `${cleaned.substring(0, 2)}.${cleaned.substring(2, 5)}.${cleaned.substring(5, 8)}/${cleaned.substring(8, 12)}-${cleaned.substring(12, 14)}`;
  } else {
    return cnpj;
  }
};

// Format CPF
export const formatCpf = (cpf: string): string => {
  if (!cpf) return '';
  
  // Remove non-numeric characters
  const cleaned = cpf.replace(/\D/g, '');
  
  // Format: XXX.XXX.XXX-XX
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9, 11)}`;
  } else {
    return cpf;
  }
};
