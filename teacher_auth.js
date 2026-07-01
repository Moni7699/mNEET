<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>mNEET - Teacher Gateway</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --gold: #F3B917;
            --burgundy: #800020;
            --bg-app: #090D16;
            --bg-surface: #131A26;
            --bg-input: #030712;
            --text-title: #FFFFFF;
            --text-para: #94A3B8;
            --black-stroke: 2px solid #000000;
        }

        body.theme-white {
            --bg-app: #F8FAFC;
            --bg-surface: #FFFFFF;
            --bg-input: #F1F5F9;
            --text-title: #451A03;
            --text-para: #7F1D1D;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            background-color: var(--bg-app);
            color: var(--text-title);
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            transition: all 0.2s ease;
        }

        .auth-container-box {
            width: 100%;
            max-width: 420px;
            background-color: var(--bg-surface);
            padding: 30px 24px;
            border-radius: 20px;
            border: var(--black-stroke);
            box-shadow: 5px 5px 0px #000000;
            text-align: center;
        }

        .auth-logo-header {
            font-weight: 900;
            font-size: 28px;
            margin-bottom: 8px;
        }
        .auth-logo-header span.m-brand { color: var(--text-title); }
        .auth-logo-header span.neet-brand { color: var(--gold); }
        
        .panel-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 800;
            color: #0284C7;
            background: rgba(2, 132, 199, 0.1);
            border: 1px solid rgba(2, 132, 199, 0.3);
            padding: 4px 12px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 24px;
        }

        .auth-subtitle {
            font-size: 14px;
            color: var(--text-para);
            margin-bottom: 24px;
            font-weight: 500;
            line-height: 1.4;
        }

        .entry-group {
            text-align: left;
            margin-bottom: 18px;
        }
        .entry-group label {
            display: block;
            font-size: 12px;
            font-weight: 800;
            margin-bottom: 6px;
            text-transform: uppercase;
            color: var(--text-title);
            letter-spacing: 0.5px;
        }
        .entry-ctrl {
            width: 100%;
            padding: 14px;
            border: var(--black-stroke) !important;
            border-radius: 12px;
            font-size: 15px;
            background: var(--bg-input) !important;
            color: var(--text-title) !important;
            outline: none;
            font-weight: 600;
            transition: 0.2s;
        }
        .entry-ctrl:focus {
            border-color: var(--gold) !important;
            box-shadow: 3px 3px 0px rgba(243, 185, 23, 0.2);
        }

        .btn-gate-auth {
            width: 100%;
            background: var(--gold) !important;
            color: #000000 !important;
            font-weight: 900;
            padding: 14px;
            border: var(--black-stroke);
            border-radius: 14px;
            text-transform: uppercase;
            box-shadow: 4px 4px 0px #000000;
            cursor: pointer;
            font-size: 15px;
            margin-top: 10px;
            letter-spacing: 0.5px;
            transition: 0.1s;
        }
        .btn-gate-auth:active {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0px #000000;
        }

        .error-message-box {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.4);
            color: #EF4444;
            padding: 10px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 700;
            margin-bottom: 16px;
            display: none;
        }
    </style>
</head>
<body class="theme-dark">

    <div class="auth-container-box">
        <div class="auth-logo-header">
            <span class="m-brand">m</span><span class="neet-brand">NEET</span>
        </div>
        <div class="panel-badge">Instructor Command Hub</div>
        
        <p class="auth-subtitle">Verify your structural authorization security keys to initialize class lectures node routing channels.</p>
        
        <div class="error-message-box" id="authErrorDisplay">Invalid Access Key Sequence Parameters!</div>

        <form id="teacherAuthForm">
            <div class="entry-group">
                <label>Secure Mentor Access Token</label>
                <input type="text" id="teacherTokenInput" class="entry-ctrl" placeholder="e.g., MNEET-MTR-XXXXXX" required autocomplete="off">
            </div>
            
            <button type="submit" class="btn-gate-auth">Initialize Console</button>
        </form>
    </div>

    <script>
        const TEACHER_STORAGE_KEY = 'mneet_registered_teachers_db';
        const SESSION_ACTIVE_KEY = 'mneet_teacher_logged_session';

        document.getElementById('teacherAuthForm').addEventListener('submit', function(e) {
            e.preventDefault();
            const token = document.getElementById('teacherTokenInput').value.trim();
            const errorBox = document.getElementById('authErrorDisplay');
            
            errorBox.style.display = 'none';

            // Local storage theke authorized dynamic tokens arrays pull kora map check-er jonno
            let registeredTeachers = JSON.parse(localStorage.getItem(TEACHER_STORAGE_KEY)) || [];
            
            // Checking standard mapping sequence profile parameters
            let verifiedInstructor = registeredTeachers.find(t => t.authKey === token);

            if (verifiedInstructor) {
                // Set active authenticated session variables token values data models
                localStorage.setItem(SESSION_ACTIVE_KEY, JSON.stringify({
                    id: verifiedInstructor.id,
                    name: verifiedInstructor.name,
                    subject: verifiedInstructor.subject,
                    role: verifiedInstructor.role,
                    loggedInAt: Date.now()
                }));
                
                // Route redirection forward logic directly inside teacher interface station screen
                window.location.href = 'teacher_dashboard.html';
            } else {
                // If token strings fails to resolve against collection objects inside database storage layer
                errorBox.style.display = 'block';
            }
        });

        // Sync dark mode baseline checking from standard client parameters options rules tracking
        if(window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            document.body.className = 'theme-white';
        }
    </script>
</body>
</html>
  
