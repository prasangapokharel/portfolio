(function (global) {
  function getConfig() {
    return global.UPSTASH_CONFIG || {};
  }

  function authHeaders() {
    const { token } = getConfig();
    if (!token) {
      throw new Error('Upstash token is missing');
    }

    return {
      Authorization: `Bearer ${token}`
    };
  }

  function commandUrl(command, key) {
    const { url } = getConfig();
    return `${url}/${command}/${encodeURIComponent(key)}`;
  }

  function parseStoredValue(value) {
    let parsed = value;

    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }

    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }

    return parsed;
  }

  async function loadDb() {
    const { submissionsKey } = getConfig();
    const response = await fetch(commandUrl('get', submissionsKey), {
      headers: authHeaders()
    });

    if (!response.ok) {
      throw new Error('Could not load submissions from Upstash');
    }

    const data = await response.json();
    if (!data.result) {
      return { submissions: [] };
    }

    const parsed = parseStoredValue(data.result);
    return Array.isArray(parsed.submissions) ? parsed : { submissions: [] };
  }

  async function saveDb(db) {
    const { submissionsKey } = getConfig();
    const response = await fetch(commandUrl('set', submissionsKey), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(db)
    });

    if (!response.ok) {
      throw new Error('Could not save submissions to Upstash');
    }

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }

    return db;
  }

  async function addSubmission(submission) {
    const db = await loadDb();
    db.submissions.unshift(submission);
    await saveDb(db);
    return db;
  }

  function createSubmission(formData) {
    return {
      id: Date.now().toString(),
      service: formData.service,
      name: formData.name,
      email: formData.email,
      company: formData.company || 'N/A',
      budget: formData.budget || 'N/A',
      message: formData.message,
      status: 'new',
      submittedAt: new Date().toISOString()
    };
  }

  global.SubmissionsDb = {
    isReady: () => Boolean(getConfig().url && getConfig().token),
    loadDb,
    saveDb,
    addSubmission,
    createSubmission
  };
})(window);
