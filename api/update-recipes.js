export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { password, newRecipes } = req.body;

  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_PAT;
  const OWNER = 'Ashx-xhsA';
  const REPO = 'whatcanweeatifyougo-yeahwhattoeat';
  const FILE_PATH = 'src/data/recipes.json';

  try {
    // 1. Get the current file content to get the SHA
    const getFileResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!getFileResponse.ok) {
      const errorData = await getFileResponse.json();
      return res.status(getFileResponse.status).json({ message: 'Failed to fetch file from GitHub', details: errorData });
    }

    const fileData = await getFileResponse.json();
    const sha = fileData.sha;

    // 2. Update the file
    const content = Buffer.from(JSON.stringify(newRecipes, null, 2)).toString('base64');
    
    const updateResponse = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'admin: update recipes via web editor',
          content: content,
          sha: sha,
        }),
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      return res.status(updateResponse.status).json({ message: 'Failed to update file on GitHub', details: errorData });
    }

    return res.status(200).json({ message: 'Recipes updated successfully! The site will rebuild automatically.' });
  } catch (error) {
    console.error('Error updating recipes:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
