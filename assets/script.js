let fileTreeElement = document.getElementById('file-tree');

fetch('files.json')
  .then(res => res.json())
  .then(data => renderTree(data, fileTreeElement));

function renderTree(nodes, container, path = 'files') {
  nodes.forEach(node => {
    const item = document.createElement('div');
    item.className = 'file-item';

    const icon = document.createElement('img');
    const isFolder = node.type === 'folder';

    icon.src = isFolder
      ? 'assets/icons/folder.png'
      : `assets/icons/${(node.name.split('.').pop() || 'file').toLowerCase()}.png`;

    icon.onerror = () => { icon.src = 'assets/icons/file.png'; };

    const toggle = document.createElement('span');
    toggle.textContent = isFolder ? '▶' : '';
    toggle.className = 'toggle';

    const name = document.createElement('span');
    name.textContent = ' ' + node.name;
    name.style.cursor = 'pointer';

    item.appendChild(toggle);
    item.appendChild(icon);
    item.appendChild(name);
    container.appendChild(item);

    if (isFolder) {
      const subContainer = document.createElement('div');
      subContainer.style.display = 'none';
      subContainer.style.marginLeft = '20px';
      container.appendChild(subContainer);

      toggle.onclick = () => {
        const open = subContainer.style.display === 'block';
        subContainer.style.display = open ? 'none' : 'block';
        toggle.textContent = open ? '▶' : '▼';
      };

      name.onclick = () => {
        downloadFolder(path + '/' + node.name);
      };

      renderTree(node.children, subContainer, path + '/' + node.name);
    } else {
      name.onclick = () => {
        window.open(path + '/' + node.name, '_blank');
      };
    }
  });
}

function downloadFolder(folderPath) {
  fetch('files.json')
    .then(res => res.json())
    .then(data => {
      const zip = new JSZip();
      collectFiles(data, folderPath, 'files', zip).then(() => {
        zip.generateAsync({ type: 'blob' }).then(content => {
          saveAs(content, folderPath.split('/').pop() + '.zip');
        });
      });
    });
}

async function collectFiles(nodes, targetPath, currentPath, zipFolder) {
  for (let node of nodes) {
    const fullPath = currentPath + '/' + node.name;
    if (targetPath === fullPath && node.type === 'folder') {
      await addFolderToZip(node, fullPath, zipFolder);
    } else if (node.type === 'folder') {
      await collectFiles(node.children, targetPath, fullPath, zipFolder);
    }
  }
}

async function addFolderToZip(folderNode, path, zipFolder) {
  const folder = zipFolder.folder(folderNode.name);
  for (let child of folderNode.children) {
    const childPath = path + '/' + child.name;
    if (child.type === 'folder') {
      await addFolderToZip(child, childPath, folder);
    } else {
      const fileBlob = await fetch(childPath).then(res => res.blob());
      folder.file(child.name, fileBlob);
    }
  }
}