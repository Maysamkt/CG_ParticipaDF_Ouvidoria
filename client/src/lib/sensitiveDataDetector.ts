/**
 * Padrões regex para detecção de dados sensíveis
 * Estes são padrões simples e locais, sem envio de dados para servidores externos
 */

const PATTERNS = {
  cpf: /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g,
  cnpj: /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/g,
  rg: /\b\d{1,2}\.?\d{3}\.?\d{3}[-/]?\d{1,2}\b/g,
  address: /\b(?:rua|avenida|av\.|alameda|travessa|praça|pça|passagem|via|estrada|rodovia|caminho|beco|largo|logradouro)\s+[^\n,]+/gi,
};

export interface SensitiveDataMatch {
  type: 'cpf' | 'cnpj' | 'email' | 'phone' | 'rg' | 'address';
  value: string;
  index: number;
  length: number;
}

/**
 * Detecta dados sensíveis no texto
 */
export function detectSensitiveData(text: string): SensitiveDataMatch[] {
  const matches: SensitiveDataMatch[] = [];

  // CPF
  let match;
  const cpfRegex = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
  while ((match = cpfRegex.exec(text)) !== null) {
    matches.push({
      type: 'cpf',
      value: match[0],
      index: match.index,
      length: match[0].length,
    });
  }

  // CNPJ
  const cnpjRegex = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g;
  while ((match = cnpjRegex.exec(text)) !== null) {
    matches.push({
      type: 'cnpj',
      value: match[0],
      index: match.index,
      length: match[0].length,
    });
  }

  // Email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  while ((match = emailRegex.exec(text)) !== null) {
    matches.push({
      type: 'email',
      value: match[0],
      index: match.index,
      length: match[0].length,
    });
  }

  // Telefone
  const phoneRegex = /\b(?:\+55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    matches.push({
      type: 'phone',
      value: match[0],
      index: match.index,
      length: match[0].length,
    });
  }

  // RG
  const rgRegex = /\b\d{1,2}\.?\d{3}\.?\d{3}[-/]?\d{1,2}\b/g;
  while ((match = rgRegex.exec(text)) !== null) {
    matches.push({
      type: 'rg',
      value: match[0],
      index: match.index,
      length: match[0].length,
    });
  }

  // Endereço (limitado para evitar falsos positivos)
  const addressRegex = /\b(?:rua|avenida|av\.|alameda|travessa|praça|pça|passagem|via|estrada|rodovia|caminho|beco|largo|logradouro)\s+[^\n,]+/gi;
  while ((match = addressRegex.exec(text)) !== null) {
    if (match[0].length < 100) {
      matches.push({
        type: 'address',
        value: match[0],
        index: match.index,
        length: match[0].length,
      });
    }
  }

  // Ordena por índice
  return matches.sort((a, b) => a.index - b.index);
}

/**
 * Retorna descrição legível do tipo de dado sensível
 */
export function getSensitiveDataLabel(type: SensitiveDataMatch['type']): string {
  const labels: Record<SensitiveDataMatch['type'], string> = {
    cpf: 'CPF',
    cnpj: 'CNPJ',
    email: 'E-mail',
    phone: 'Telefone',
    rg: 'RG',
    address: 'Endereço',
  };
  return labels[type];
}

/**
 * Verifica se há dados sensíveis no texto
 */
export function hasSensitiveData(text: string): boolean {
  return detectSensitiveData(text).length > 0;
}

/**
 * Retorna resumo dos dados sensíveis encontrados
 */
export function getSensitiveDataSummary(text: string): string[] {
  const matches = detectSensitiveData(text);
  const types = new Set(matches.map(m => getSensitiveDataLabel(m.type)));
  return Array.from(types);
}
