// Copy this code and create 3 separate files named viewQuestion.js, viewNcert.js, and viewStudents.js inside src/admin/
export function renderQuestion(canvas, activeTestId) {
    canvas.innerHTML = `<div class="card"><h2>Question Injector Engine</h2>${activeTestId ? `<p style="color:var(--accent-color);">Context Locked to Test Node: ${activeTestId}</p>` : `<p style="color:#ef4444;">🔒 Lock a test instance from Home route first.</p>`}</div>`;
}
// Do the same for viewNcert (export function renderNcert...) and viewStudents (export function renderStudents...)

