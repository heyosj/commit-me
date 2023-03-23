#!/usr/bin/env node
require('dotenv').config();
const { execSync } = require('child_process')
const openai = require('openai')

const apiKey = process.env.OPENAI_API_KEY

function getStagedChanges() {
  return execSync('git diff --cached', { encoding: 'utf-8' })
}

async function generateCommitMessage(changes) {
  const prompt = `Please generate a commit message based on the following changes:\n\n${changes}`
  const response = await openai.completions.create({
    engine: 'davinci',
    prompt,
    maxTokens: 64,
    n: 1,
    stop: ['\n\n'],
    apiKey,
  })
  return response.data.choices[0].text.trim()
}

const changes = getStagedChanges()

generateCommitMessage(changes)
  .then(message => {
    const messageFile = process.argv[2]
    const messageContent = message.trim() + '\n'
    require('fs').writeFileSync(messageFile, messageContent)
  })
  .catch(error => {
    console.error(error)
    process.exit(1)
  })
