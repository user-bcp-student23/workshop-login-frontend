export async function verifyBrowserFlow(page, baseUrl = 'http://localhost:4317') {
  await page.goto(`${baseUrl}/login`);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('workshop_token', 'legacy-token');
    localStorage.setItem('workshop_user', '{"username":"legacy"}');
    localStorage.setItem('workshop_preferences', '{"theme":"dark"}');
  });
  await page.reload();
  const assertSession = async (signedIn) => {
    const state = await page.evaluate(() => ({
      legacyToken: localStorage.getItem('workshop_token'),
      legacyUser: localStorage.getItem('workshop_user'),
      token: sessionStorage.getItem('workshop_token'),
      user: sessionStorage.getItem('workshop_user'),
      preferences: JSON.parse(localStorage.getItem('workshop_preferences') || '{}')
    }));
    if (state.legacyToken !== null || state.legacyUser !== null
      || state.token !== (signedIn ? 'test-token' : null)
      || state.user !== (signedIn ? JSON.stringify({ username: 'student', displayName: 'Student' }) : null)
      || state.preferences.theme !== 'dark') {
      throw new Error('H-01: session persistence or preference preservation failed');
    }
  };
  await assertSession(false);
  await page.route('http://localhost:8080/auth/login', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ token: 'test-token', user: { username: 'student', displayName: 'Student' } })
  }));
  await page.route('http://localhost:8000/api/tasks?owner=student', route => {
    if (route.request().headers().authorization !== 'Bearer test-token') {
      throw new Error('H-01: task request must keep its Bearer header');
    }
    return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([{
      title: 'Requirement', description: 'Browser fixture', status: 'TODO', priority: 'HIGH', owner: 'student'
    }])
    });
  });
  try {
    await page.getByRole('textbox', { name: 'Usuario', exact: true }).fill('student');
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('Workshop123!');
    await page.getByRole('button', { name: 'Ingresar', exact: true }).click();
    await page.waitForURL('**/dashboard');
    await assertSession(true);
    await page.getByRole('heading', { name: 'Requirement', exact: true })
      .waitFor({ state: 'visible', timeout: 7000 });
    await page.reload();
    await page.getByRole('heading', { name: 'Requirement', exact: true })
      .waitFor({ state: 'visible', timeout: 7000 });
    await assertSession(true);
    await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
    await page.waitForURL('**/login');
    await assertSession(false);
  } finally {
    if (page.url().endsWith('/dashboard')) {
      await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
      await page.waitForURL('**/login');
    }
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.unrouteAll({ behavior: 'wait' });
  }
}
