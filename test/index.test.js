const request = require('supertest');
const express = require('express');
const app = require('../index'); // Assuming your app is defined in a separate file

describe('GET /', () => {
  test('It should respond with status 200 and render index page', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"><link rel=\"shortcut icon\" type=\"image/png\" href=\"/images/favicon.png\"><link rel=\"stylesheet\" href=\"/stylesheets/style.css\"><title>CTO.ai</title></head><body><img id=\"logo\" src=\"/images/cto_logo_primary.svg\" alt=\"CTO.ai logo\"><br><img id=\"rocket\" src=\"/images/cto_rocket.png\" alt=\"CTO.ai Rocket\"><div id=\"content\"><h1>Success!</h1><h2>PROD-136</h2><p>Congratulations, your service was deployed successfully on the Developer Control Plane!</p><a href=\"https://cto.ai/docs\">Explore our Documentation</a></div></body></html>");
  });
});

describe('POST /signup', () => {
  test('It should create a new user with posts', async () => {
    const response = await request(app)
      .post('/signup')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        posts: [{ title: 'Test Post', content: 'This is a test post' }]
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('name', 'Test User');
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });
});

// Write similar tests for other routes like POST /post, PUT /post/:id/views, PUT /publish/:id, DELETE /post/:id, GET /users, GET /user/:id/drafts, GET /post/:id, GET /feed
