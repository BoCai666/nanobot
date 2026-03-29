import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '$lib/utils/markdown';

describe('parseMarkdown', () => {
	describe('tables', () => {
		it('should render basic table', () => {
			const input = '| A | B |\n|---|---|\n| 1 | 2 |';
			const result = parseMarkdown(input);
			expect(result).toContain('<table');
			expect(result).toContain('<thead');
			expect(result).toContain('<tbody');
			expect(result).toContain('<tr');
			expect(result).toContain('<th');
			expect(result).toContain('<td');
		});

		it('should render table with multiple rows', () => {
			const input = '| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |';
			const result = parseMarkdown(input);
			expect(result).toContain('Alice');
			expect(result).toContain('Bob');
			expect(result).toContain('30');
			expect(result).toContain('25');
		});

		it('should render table without header', () => {
			const input = '| A | B |\n|---|---|\n| 1 | 2 |';
			const result = parseMarkdown(input);
			expect(result).toContain('<table');
		});
	});

	describe('lists', () => {
		describe('unordered lists', () => {
			it('should render unordered list', () => {
				const input = '- item1\n- item2\n- item3';
				const result = parseMarkdown(input);
				expect(result).toContain('<ul');
				expect(result).toContain('<li');
				expect(result).toContain('item1');
				expect(result).toContain('item2');
				expect(result).toContain('item3');
			});

			it('should render nested unordered list', () => {
				const input = '- item1\n  - nested1\n  - nested2\n- item2';
				const result = parseMarkdown(input);
				expect(result).toContain('<ul');
				expect(result).toContain('item1');
				expect(result).toContain('nested1');
			});
		});

		describe('ordered lists', () => {
			it('should render ordered list', () => {
				const input = '1. item1\n2. item2\n3. item3';
				const result = parseMarkdown(input);
				expect(result).toContain('<ol');
				expect(result).toContain('<li');
				expect(result).toContain('item1');
				expect(result).toContain('item2');
				expect(result).toContain('item3');
			});

			it('should render nested ordered list', () => {
				const input = '1. item1\n   1. nested1\n   2. nested2\n2. item2';
				const result = parseMarkdown(input);
				expect(result).toContain('<ol');
				expect(result).toContain('item1');
				expect(result).toContain('nested1');
			});
		});
	});

	describe('blockquotes', () => {
		it('should render basic blockquote', () => {
			const input = '> quote text';
			const result = parseMarkdown(input);
			expect(result).toContain('<blockquote');
			expect(result).toContain('quote text');
		});

		it('should render blockquote with multiple lines', () => {
			const input = '> line1\n> line2\n> line3';
			const result = parseMarkdown(input);
			expect(result).toContain('<blockquote');
			expect(result).toContain('line1');
			expect(result).toContain('line2');
			expect(result).toContain('line3');
		});

		it('should render nested blockquote', () => {
			const input = '> outer\n> > inner';
			const result = parseMarkdown(input);
			expect(result).toContain('<blockquote');
		});
	});

	describe('code blocks', () => {
		it('should render inline code', () => {
			const input = 'Use `code` here';
			const result = parseMarkdown(input);
			expect(result).toContain('<code');
		});

		it('should render fenced code block with language', () => {
			const input = '```javascript\nconst x = 1;\n```';
			const result = parseMarkdown(input);
			expect(result).toContain('<pre');
			expect(result).toContain('<code');
			expect(result).toContain('javascript');
			expect(result).toContain('const x = 1');
		});

		it('should render code block without language', () => {
			const input = '```\nplain code\n```';
			const result = parseMarkdown(input);
			expect(result).toContain('<pre');
			expect(result).toContain('<code');
			expect(result).toContain('plain code');
		});

		it('should render code block with language class', () => {
			const input = '```python\nprint("hello")\n```';
			const result = parseMarkdown(input);
			expect(result).toContain('language-python');
			expect(result).toContain('python');
		});
	});

	describe('XSS protection', () => {
		it('should sanitize script tag', () => {
			const input = '<script>alert("xss")</script>';
			const result = parseMarkdown(input);
			expect(result).not.toContain('<script');
			expect(result).not.toContain('alert');
		});

		it('should sanitize onclick attribute', () => {
			const input = '<div onclick="alert(1)">click me</div>';
			const result = parseMarkdown(input);
			expect(result).not.toContain('onclick');
		});

		it('should sanitize onerror attribute', () => {
			const input = '<img src="x" onerror="alert(1)">';
			const result = parseMarkdown(input);
			expect(result).not.toContain('onerror');
		});

		it('should allow safe HTML tags', () => {
			const input = '<strong>bold</strong> and <em>italic</em>';
			const result = parseMarkdown(input);
			expect(result).toContain('<strong>bold</strong>');
			expect(result).toContain('<em>italic</em>');
		});

		it('should allow safe links', () => {
			const input = '[link](https://example.com)';
			const result = parseMarkdown(input);
			expect(result).toContain('<a');
			expect(result).toContain('href="https://example.com"');
		});

		it('should sanitize javascript: protocol in href', () => {
			const input = '[link](javascript:alert(1))';
			const result = parseMarkdown(input);
			expect(result).not.toContain('javascript:');
		});
	});

	describe('edge cases', () => {
		it('should return empty string for null input', () => {
			expect(parseMarkdown(null as unknown as string)).toBe('');
		});

		it('should return empty string for undefined input', () => {
			expect(parseMarkdown(undefined as unknown as string)).toBe('');
		});

		it('should return empty string for empty string', () => {
			expect(parseMarkdown('')).toBe('');
		});

		it('should handle plain text without markdown', () => {
			const input = 'Just plain text';
			const result = parseMarkdown(input);
			expect(result).toContain('Just plain text');
		});

		it('should handle mixed content', () => {
			const input = '# Heading\n\nSome text with **bold** and *italic*.\n\n- list item\n\n> quote';
			const result = parseMarkdown(input);
			expect(result).toContain('<h1');
			expect(result).toContain('Heading');
			expect(result).toContain('<strong>bold</strong>');
			expect(result).toContain('<em>italic</em>');
			expect(result).toContain('<ul');
			expect(result).toContain('<blockquote');
		});
	});
});
