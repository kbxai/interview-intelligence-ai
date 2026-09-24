const MAX_MARKDOWN_LENGTH = 50000;
const allowedLinkPattern = /^(https?:\/\/|mailto:)/i;

function escapeHtml(value = '') {
    return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function inlineMarkdown(value) {
    let html = escapeHtml(value);
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, href) => {
        const safeHref = allowedLinkPattern.test(href) ? href : '#';
        return `<a href="${escapeHtml(safeHref)}">${label}</a>`;
    });
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    return html;
}

function sanitizeResumeMarkdown(markdown) {
    if (typeof markdown !== 'string') {
        throw new Error('Resume Markdown must be text');
    }
    if (markdown.length > MAX_MARKDOWN_LENGTH) {
        throw new Error('Resume Markdown is too long');
    }

    return markdown
        .replace(/<[^>]*>/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/^\s*[-*_]{3,}\s*$/gm, '')
        .trim();
}

function markdownToSafeHtml(markdown) {
    const cleanMarkdown = sanitizeResumeMarkdown(markdown);
    const lines = cleanMarkdown.split(/\r?\n/);
    const output = [];
    let listItems = [];

    function flushList() {
        if (listItems.length) {
            output.push(`<ul>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
            listItems = [];
        }
    }

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            flushList();
            continue;
        }
        if (/^[-*]\s+/.test(trimmed)) {
            listItems.push(trimmed.replace(/^[-*]\s+/, ''));
            continue;
        }
        flushList();
        const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
        if (heading) {
            const level = heading[1].length;
            output.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
            continue;
        }
        output.push(`<p>${inlineMarkdown(trimmed)}</p>`);
    }

    flushList();
    return output.join('');
}

function structuredResumeToMarkdown(resume) {
    const contact = [resume.candidate.email, resume.candidate.phone, resume.candidate.location, resume.candidate.links.linkedin, resume.candidate.links.github, resume.candidate.links.portfolio].filter(Boolean).join(' | ');
    const lines = [`# ${resume.candidate.name || resume.title}`, '', `_${resume.targetRole}_`, contact, '', '## Professional Summary', '', resume.summary, '', '## Skills', '', resume.skills.join(' | ')];

    if (resume.experience.length) {
        lines.push('', '## Experience');
        resume.experience.forEach((item) => {
            lines.push('', `### ${item.role} | ${item.company}`, item.dates, ...item.bullets.map((bullet) => `- ${bullet}`));
        });
    }
    if (resume.projects.length) {
        lines.push('', '## Projects');
        resume.projects.forEach((item) => {
            lines.push('', `### ${item.name}`, item.technologies.join(' | '), ...item.bullets.map((bullet) => `- ${bullet}`));
        });
    }
    if (resume.education.length) {
        lines.push('', '## Education', '', ...resume.education.flatMap((item) => [`### ${item.degree}`, `${item.institution} | ${item.dates}`, '']));
    }
    if (resume.certifications.length) {
        lines.push('## Certifications', '', ...resume.certifications.map((item) => `- ${item}`));
    }

    return lines.join('\n').trim();
}

module.exports = { MAX_MARKDOWN_LENGTH, sanitizeResumeMarkdown, markdownToSafeHtml, structuredResumeToMarkdown };
