async function loadJson(path) {
    const res = await fetch(path);
    if (!res.ok) throw new Error('Failed to load ' + path + ' (' + res.status + ')');
    return await res.json();
}

async function bootstrap() {
    const [appConfig, commandsConfig] = await Promise.all([
        loadJson('assets/config/app.json'),
        loadJson('assets/config/commands.json')
    ]);

    document.title = appConfig.title || appConfig.name || 'Console';

    new Terminal(appConfig, commandsConfig);
}

document.addEventListener('DOMContentLoaded', () => {
    bootstrap().catch((err) => {
        console.error('[App] Failed to bootstrap:', err);
    });
});
