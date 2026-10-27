/**
 * CMRG Data Collect - Universal Questionnaire Logic Engine
 * Handles dynamic skip logic, compound relevance rules, dynamic text piping,
 * formula calculations, validation checks, and screenout/termination triggers.
 */

import { Question, QuestionValidation } from '../types';

export const LogicEngine = {
  /**
   * Evaluates if a question is relevant (should be displayed) based on current answers.
   * Supports operators: ==, !=, >, <, >=, <=, in, not_in, and compound '&&' / '||'.
   * Example: "q_age >= 18 && q_consent == 'yes'"
   */
  isQuestionRelevant(question: Question, answers: Record<string, any>): boolean {
    if (!question.relevantCondition || question.relevantCondition.trim() === '') {
      return true;
    }

    try {
      const condition = question.relevantCondition.trim();

      // Compound AND logic
      if (condition.includes('&&')) {
        const parts = condition.split('&&');
        return parts.every(part => this.evaluateSimpleCondition(part.trim(), answers));
      }

      // Compound OR logic
      if (condition.includes('||')) {
        const parts = condition.split('||');
        return parts.some(part => this.evaluateSimpleCondition(part.trim(), answers));
      }

      return this.evaluateSimpleCondition(condition, answers);
    } catch (e) {
      console.warn(`Error evaluating relevance condition "${question.relevantCondition}":`, e);
      return true; // Default to showing on parse error
    }
  },

  /**
   * Evaluates single clause e.g. "q_consent == 'yes'" or "age >= 18"
   */
  evaluateSimpleCondition(clause: string, answers: Record<string, any>): boolean {
    // Regex matching: variableName operator value
    // e.g. q1 == 'yes', age >= 18, brand != 'none'
    const match = clause.match(/^([a-zA-Z0-9_]+)\s*(==|!=|>=|<=|>|<|=|contains|in)\s*(.+)$/);
    if (!match) return true;

    const [, varName, op, rawVal] = match;
    const answer = answers[varName];

    // Clean target value
    let targetVal: any = rawVal.trim();
    if ((targetVal.startsWith("'") && targetVal.endsWith("'")) || (targetVal.startsWith('"') && targetVal.endsWith('"'))) {
      targetVal = targetVal.substring(1, targetVal.length - 1);
    } else if (!isNaN(Number(targetVal))) {
      targetVal = Number(targetVal);
    } else if (targetVal === 'true') targetVal = true;
    else if (targetVal === 'false') targetVal = false;

    if (answer === undefined || answer === null || answer === '') {
      return op === '!=' ? targetVal !== '' : false;
    }

    switch (op) {
      case '==':
      case '=':
        return String(answer).toLowerCase() === String(targetVal).toLowerCase();
      case '!=':
        return String(answer).toLowerCase() !== String(targetVal).toLowerCase();
      case '>':
        return Number(answer) > Number(targetVal);
      case '<':
        return Number(answer) < Number(targetVal);
      case '>=':
        return Number(answer) >= Number(targetVal);
      case '<=':
        return Number(answer) <= Number(targetVal);
      case 'contains':
      case 'in':
        if (Array.isArray(answer)) {
          return answer.map(a => String(a).toLowerCase()).includes(String(targetVal).toLowerCase());
        }
        return String(answer).toLowerCase().includes(String(targetVal).toLowerCase());
      default:
        return true;
    }
  },

  /**
   * Replaces piping tokens like "{{household_head}}" or "{{brand_name}}" with actual answered values
   */
  pipeText(template: string, answers: Record<string, any>): string {
    if (!template || !template.includes('{{')) return template;
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, varName) => {
      const val = answers[varName];
      if (val === undefined || val === null || val === '') {
        return `[${varName}]`;
      }
      if (typeof val === 'object') {
        if (val.label) return val.label;
        if (Array.isArray(val)) return val.join(', ');
        return JSON.stringify(val);
      }
      return String(val);
    });
  },

  /**
   * Evaluates calculated fields (e.g. "q_price * q_qty" or "income - expenses")
   */
  evaluateCalculation(formula: string, answers: Record<string, any>): number | string {
    if (!formula) return 0;
    try {
      // Replace variable names with their numeric values
      let expr = formula.replace(/[a-zA-Z0-9_]+/g, (match) => {
        // Built-in functions or math constants
        if (['Math', 'round', 'floor', 'ceil', 'abs', 'min', 'max'].includes(match)) {
          return `Math.${match}`;
        }
        const val = answers[match];
        const num = Number(val);
        return isNaN(num) ? '0' : String(num);
      });

      // Safe mathematical evaluation
      // Allow only numbers, operators +, -, *, /, %, (, ), ., and Math.*
      if (/^[0-9+\-*/%().\sMathroundfloorceilabsminmax]+$/.test(expr)) {
        // eslint-disable-next-line no-new-func
        const result = new Function(`return (${expr})`)();
        if (typeof result === 'number' && !isNaN(result)) {
          return Math.round(result * 100) / 100;
        }
      }
      return 0;
    } catch (e) {
      return 0;
    }
  },

  /**
   * Validates an answer against question validation rules (min, max, length, regex)
   */
  validateAnswer(question: Question, val: any): { valid: boolean; error?: string } {
    if (question.required) {
      if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
        return { valid: false, error: 'This question is mandatory according to study protocol.' };
      }
    }

    const v: QuestionValidation | undefined = question.validation;
    if (!v || val === undefined || val === null || val === '') {
      return { valid: true };
    }

    // Number min/max
    if (question.type === 'integer' || question.type === 'decimal') {
      const num = Number(val);
      if (v.minValue !== undefined && num < v.minValue) {
        return { valid: false, error: v.customErrorMessage || `Value must be at least ${v.minValue}.` };
      }
      if (v.maxValue !== undefined && num > v.maxValue) {
        return { valid: false, error: v.customErrorMessage || `Value must not exceed ${v.maxValue}.` };
      }
    }

    // Text min/max length
    if (typeof val === 'string') {
      if (v.minLength !== undefined && val.length < v.minLength) {
        return { valid: false, error: v.customErrorMessage || `Minimum ${v.minLength} characters required.` };
      }
      if (v.maxLength !== undefined && val.length > v.maxLength) {
        return { valid: false, error: v.customErrorMessage || `Maximum ${v.maxLength} characters permitted.` };
      }
      if (v.regexPattern) {
        try {
          const reg = new RegExp(v.regexPattern);
          if (!reg.test(val)) {
            return { valid: false, error: v.customErrorMessage || 'Value does not match required format.' };
          }
        } catch {
          // Ignore invalid regex
        }
      }
    }

    // Constant sum validation
    if (question.type === 'constant_sum' && typeof val === 'object') {
      const target = question.constantSumTotal || 100;
      const sum = Object.values(val).reduce((acc: number, cur: any) => acc + (Number(cur) || 0), 0);
      if (sum !== target) {
        return { valid: false, error: `Allocations must sum exactly to ${target} (current sum: ${sum}).` };
      }
    }

    return { valid: true };
  },

  /**
   * Checks if an answer triggers a Screenout / Termination condition
   */
  checkScreenout(question: Question, answers: Record<string, any>): { screenout: boolean; message?: string } {
    if (!question.screenoutCondition || question.screenoutCondition.trim() === '') {
      return { screenout: false };
    }

    const triggers = this.evaluateSimpleCondition(question.screenoutCondition.trim(), answers);
    if (triggers) {
      return {
        screenout: true,
        message: question.screenoutMessage || 'Respondent does not meet the eligibility screening criteria for this research study.'
      };
    }
    return { screenout: false };
  }
};
