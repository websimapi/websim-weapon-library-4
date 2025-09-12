export function adjustColor(color, percent) {
  if (!color) return '#ffffff';
  
  // Handle named colors by converting to hex
  const namedColors = {
    white: '#ffffff',
    black: '#000000'
    // Add other common colors as needed
  };
  
  if (namedColors[color.toLowerCase()]) {
    color = namedColors[color.toLowerCase()];
  }

  // If color doesn't start with #, return white
  if (!color.startsWith('#')) return '#ffffff';

  try {
    const num = parseInt(color.replace('#', ''), 16),
          amt = Math.round(2.55 * percent),
          R = Math.min(255, Math.max(0, (num >> 16) + amt)),
          G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt)),
          B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return '#' + (0x1000000 + (R * 0x10000) + (G * 0x100) + B).toString(16).slice(1);
  } catch (e) {
    console.error('Error adjusting color:', e);
    return '#ffffff';
  }
}

export function getRarityColor(rarity) {
  const colors = {
    'Common': '#a0a0a0',
    'Uncommon': '#4CAF50',
    'Rare': '#2196F3',
    'Epic': '#9C27B0',
    'Super-Epic': '#ff00ff',
    'Legendary': '#FFD700',
    'Mythical': '#FF0000',
    'Transcendent': '#ffffff'
  };
  return colors[rarity];
}

export function summarizeBattleHistory(battleLogs) {
  if (!battleLogs || battleLogs.length === 0) {
    return "No previous battle experience";
  }

  const victories = battleLogs.filter(log => log.winner === battleLogs[0].weaponName).length;
  const winRate = Math.round((victories / battleLogs.length) * 100);
  
  return `${battleLogs.length} battles fought with a ${winRate}% win rate. Fighter has shown ${victories > battleLogs.length / 2 ? 'great prowess' : 'room for improvement'} in combat.`;
}

export function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function colorize(text, weapons) {
  let colorized = text;
  weapons.forEach(weapon => {
    const regex = new RegExp(weapon.name, 'g');
    colorized = colorized.replace(regex, `<span class="element-${weapon.element}" style="color: var(--${weapon.rarity.toLowerCase()}-color)">${weapon.name}</span>`);
  });
  return colorized;
}

export function getElementEmoji(element, room) {
  const elementMap = {
    'None': '', 'Fire': '', 'Ice': '', 'Water': '', 'Plant': '', 'Electric': '',
    'Darkness': '', 'Light': '', 'Earth': '', 'Wind': '', 'Poison': '', 'Cute': '',
    'Noble': '', 'Undead': '', 'Arcane': '', 'Transformation': '', 'Reality': '',
    'Spirit': '', 'Inanimate': '', 'Metal': '', 'Animal': ''
  };
  const customElements = {};
  if (room) {
    room.collection('elements').getList().forEach(elem => {
      customElements[elem.name] = elem.emoji;
      if (!document.querySelector(`style[data-element="${elem.name}"]`)) {
        const styleSheet = document.createElement('style');
        styleSheet.dataset.element = elem.name;
        styleSheet.textContent = `.element-${elem.name} { color: ${elem.color}; }`;
        document.head.appendChild(styleSheet);
      }
    });
  }
  return customElements[element] || elementMap[element] || '';
}

export function createWeaponCard(weapon, room, detailed = false) {
  let html = `
    <h3>${weapon.name}</h3>
    <div class="flavor-blurb">${weapon.flavorBlurb}</div>
    ${weapon.description ? `<p>Description: ${weapon.description}</p>` : ''}
    <p>Damage: <span class="number">${weapon.damage}</span></p>
    <p class="rarity-${weapon.rarity}">Rarity: ${weapon.rarity}</p>
    <p>Price: <span class="number">${weapon.price}</span> gold</p>
    <p class="element-${weapon.element}">Element: ${getElementEmoji(weapon.element, room)} ${weapon.element}</p>
    <p>Appearance: ${weapon.appearance}</p>
    <p>Regular Attack: ${weapon.specialAbility}</p>
  `;
  
  if (weapon.rarity !== 'Common' && weapon.passiveEffects) {
    html += `<p>Passive: ${weapon.passiveEffects}</p>`;
  }

  if (weapon.additionalAbilities) {
    weapon.additionalAbilities.forEach(ability => {
      html += `<p>Additional Ability: ${ability}</p>`;
    });
  }

  if (weapon.specialZones) {
    weapon.specialZones.forEach(zone => {
      html += `<p>Special Zone: ${zone}</p>`;
    });
  }

  if (weapon.uniqueTraits) {
    weapon.uniqueTraits.forEach(trait => {
      html += `<p>Unique Trait: ${trait}</p>`;
    });
  }

  if (detailed) {
      html += `
        <button class="edit-btn" onclick="editWeapon('${weapon.id}')">✎</button>
        <button class="download-btn" onclick="downloadWeapon('${weapon.id}')">⭳</button>
        <button class="delete-btn" onclick="deleteWeapon('${weapon.id}')">×</button>
        <div class="battle-logs-header" onclick="toggleBattleLogs('${weapon.id}')">
          <span class="toggle-icon">▼</span>
          <h4>Battle History</h4>
        </div>
        <div class="battle-logs-content collapsed" id="battle-logs-${weapon.id}">
          <div class="battle-logs-list">
             <!-- Battle logs are loaded dynamically -->
          </div>
        </div>
        <div class="weapon-comments" data-weapon-id="${weapon.id}">
            <!-- Comments are loaded dynamically -->
        </div>
      `;
  }
  if (weapon.rarity === 'Transcendent') {
    const elementColors = {
      'None': '#ffffff', 'Fire': '#ff4444', 'Ice': '#00ffff', 'Water': '#4444ff',
      'Plant': '#44ff44', 'Electric': '#ffff44', 'Darkness': '#4b0082', 'Light': '#ffff80',
      'Earth': '#8b4513', 'Wind': '#008080', 'Poison': '#800080', 'Cute': '#FFB6C1',
      'Noble': '#9370DB', 'Undead': '#808000', 'Arcane': '#8B008B', 'Transformation': '#B8860B',
      'Reality': '#FF1493', 'Spirit': '#98FB98', 'Inanimate': '#00008B', 'Metal': '#4A4A4A',
      'Animal': '#654321'
    };

    if (room) {
        room.collection('elements').getList().forEach(elem => {
          elementColors[elem.name] = elem.color;
        });
    }

    const elements = [weapon.element].concat(weapon.optionalElement1 || [], weapon.optionalElement2 || []).filter(Boolean);
    
    let gradient, color;
    if (elements.length > 0) {
      const colors = elements.map(e => elementColors[e] || '#ffffff');
      gradient = colors.length === 1 
        ? `linear-gradient(45deg, ${colors[0]}, ${adjustColor(colors[0], 20)})`
        : `linear-gradient(45deg, ${colors.join(', ')})`;
      color = colors[0];
    } else {
      gradient = 'linear-gradient(45deg, #ffffff, #eeeeee)';
      color = '#ffffff';
    }

    const existingStyle = document.querySelector(`style[data-transcendent-id="${weapon.id}"]`);
    if (existingStyle) {
        existingStyle.remove();
    }

    const cardStyle = document.createElement('style');
    cardStyle.dataset.transcendentId = weapon.id;
    cardStyle.textContent = `
      .weapon-card.rarity-Transcendent[data-weapon-id="${weapon.id}"],
      .weapon-list-item.rarity-Transcendent[data-weapon-id="${weapon.id}"] {
        --transcendent-gradient: ${gradient};
        --transcendent-color: ${color};
        --transcendent-glow: ${adjustColor(color, 50)}80;
      }
    `;
    document.head.appendChild(cardStyle);
  }

  return html;
}