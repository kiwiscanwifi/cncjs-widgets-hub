(function(window) {
    'use strict';

    class WidgetLogger {
        constructor(widgetId, filename = 'activity.log') {
            this.widgetId = widgetId;
            this.filename = filename;
            this.filePath = `widgets/${widgetId}/logs/${filename}`;
            this._queue = [];
            this._flushing = false;
        }

        // Format and append a log entry
        log(message, type = 'INFO') {
            const now = new Date();
            const pad = (n, len = 2) => String(n).padStart(len, '0');
            const timeStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}.${pad(now.getMilliseconds(), 3)}`;
            const line = `[${timeStr}] [${type.toUpperCase()}] ${message}\n`;

            this._queue.push(line);
            this._scheduleFlush();
        }

        _scheduleFlush() {
            if (this._flushing || this._queue.length === 0) return;
            this._flushing = true;

            const linesToSend = this._queue.splice(0, this._queue.length).join('');
            fetch('/api/watch/file', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file: this.filePath,
                    data: linesToSend,
                    append: true
                })
            })
            .catch(err => {
                console.warn(`[WidgetLogger:${this.widgetId}] Failed to append log:`, err);
            })
            .finally(() => {
                this._flushing = false;
                if (this._queue.length > 0) {
                    setTimeout(() => this._scheduleFlush(), 250);
                }
            });
        }

        // Truncate the active log file to 0 bytes
        clear() {
            this._queue = [];
            return fetch('/api/watch/file', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file: this.filePath,
                    data: '',
                    append: false
                })
            });
        }

        // Fetch recent log contents (up to maxLines)
        readRecent(maxLines = 100) {
            return fetch(`/api/watch/file?file=${encodeURIComponent(this.filePath)}&_t=${Date.now()}`)
                .then(r => r.json())
                .then(res => {
                    if (!res || !res.data) return '';
                    const allLines = res.data.split('\n');
                    if (allLines.length > maxLines) {
                        return allLines.slice(-maxLines).join('\n');
                    }
                    return res.data;
                })
                .catch(() => '');
        }

        // Trigger browser file download
        download() {
            return fetch(`/api/watch/file?file=${encodeURIComponent(this.filePath)}&_t=${Date.now()}`)
                .then(r => r.json())
                .then(res => {
                    const content = (res && res.data) ? res.data : '';
                    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${this.widgetId}_${this.filename}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 1000);
                });
        }
    }

    window.WidgetLogger = WidgetLogger;
})(window);
