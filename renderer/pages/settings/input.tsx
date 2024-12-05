import React, { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import Swal from 'sweetalert2';

import SettingsSidebar from '../../components/settings/sidebar'
import Card from '../../components/ui/card'

import { useSettings } from '../../context/userContext'

function invert(obj) {
  const new_obj = {}
  for (const prop in obj) {
    new_obj[obj[prop]] = prop
  }
  return new_obj
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(deepClone) as unknown as T;
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, deepClone(value)])
  ) as T;
}


function makeAxis(positive, negative) {
  return { positive, negative };
}

function stickToButton(stickObj) {
  // Implementación básica de conversión de stick a botón
  return stickObj.index !== undefined ? stickObj.index : null;
}

function RemapController() {
  const canvasRef = useRef(null);
  const [gamepadConnected, setGamepadConnected] = useState(false);
  const [remappedButtons, setRemappedButtons] = useState({
    A: 0,
    B: 1,
    X: 2,
    Y: 3,
    LB: 4,
    RB: 5,
    BACK: 6,
    START: 7,
    L3: 8,
    R3: 9,
    HOME: 10,
    DPAD_UP: 12,
    DPAD_DOWN: 13,
    DPAD_LEFT: 14,
    DPAD_RIGHT: 15,
    // Triggers
    LT: 6,
    RT: 7
  });

  const [remapObj, setRemapObj] = useState<any>(null);

  useEffect(() => {
    const rawGamepads = navigator.getGamepads();
    console.log(rawGamepads)
    if (rawGamepads && rawGamepads[0]) {
      setRemapObj(deepClone(rawGamepads[0]));
    }
  }, [gamepadConnected]);

  // console.log(remapObj
  //

  const setMapping = (stickObj, setValue) => {
    const updatedRemapObj = { ...remapObj };

    switch (typeof setValue) {
      case "number":
      case "Number":
        if (stickObj.targetType === "axes") {
          updatedRemapObj[stickObj.targetType][stickObj.target] = setValue;
        } else {
          updatedRemapObj[stickObj.targetType][stickObj.target] = {
            value: setValue
          };
        }
        break;
      case "object":
      case "Object":
        if (stickObj.targetType === "axes") {
          updatedRemapObj[stickObj.targetType][stickObj.target] =
            makeAxis(stickToButton(stickObj.positive), stickToButton(stickObj.negative));
        } else {
          updatedRemapObj[stickObj.targetType][stickObj.target] = {
            value: stickToButton(stickObj)
          };
        }
        break;
      default:
        console.warn('Unsupported setValue type');
    }

    setRemapObj(updatedRemapObj);
    return updatedRemapObj;
  };

  const remapButton = (originalIndex, newIndex) => {
    const updatedMapping = { ...remappedButtons };

    // Eliminar cualquier mapeo previo del nuevo índice
    Object.keys(updatedMapping).forEach(key => {
      if (updatedMapping[key] === newIndex) {
        updatedMapping[key] = null;
      }
    });

    // Encontrar la clave del mapeo original
    const originalKey = Object.keys(updatedMapping).find(
      key => remappedButtons[key] === originalIndex
    );

    // Actualizar el mapeo
    updatedMapping[originalKey] = newIndex;
    setRemappedButtons(updatedMapping);
  };

  const drawControllerInputs = (ctx, gamepad) => {
    // Limpiar canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (!gamepad) {
      ctx.fillStyle = '#333';
      ctx.font = '20px Arial';
      ctx.fillText('Connect a gamepad', 10, 50);
      return;
    }

    // Fondo del controlador
    ctx.fillStyle = '#F0F0F0';
    ctx.fillRect(10, 10, 380, 250);

    // Contorno del controlador
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 380, 250);

    // Botones
    const buttonConfig = [
      { label: 'A', x: 320, y: 180, color: '#4CAF50', index: remappedButtons.A },
      { label: 'B', x: 350, y: 150, color: '#F44336', index: remappedButtons.B },
      { label: 'X', x: 290, y: 150, color: '#2196F3', index: remappedButtons.X },
      { label: 'Y', x: 320, y: 120, color: '#FFC107', index: remappedButtons.Y },
      { label: 'LB', x: 50, y: 220, color: '#9E9E9E', index: remappedButtons.LB },
      { label: 'RB', x: 350, y: 220, color: '#9E9E9E', index: remappedButtons.RB },
      { label: 'BACK', x: 150, y: 250, color: '#9E9E9E', index: remappedButtons.BACK },
      { label: 'START', x: 250, y: 250, color: '#9E9E9E', index: remappedButtons.START },
      { label: 'L3', x: 100, y: 220, color: '#9E9E9E', index: remappedButtons.L3 },
      { label: 'R3', x: 300, y: 220, color: '#9E9E9E', index: remappedButtons.R3 },
      { label: 'HOME', x: 200, y: 250, color: '#FF5722', index: remappedButtons.HOME },
      { label: 'DPAD_UP', x: 50, y: 150, color: '#9E9E9E', index: remappedButtons.DPAD_UP },
      { label: 'DPAD_DOWN', x: 50, y: 180, color: '#9E9E9E', index: remappedButtons.DPAD_DOWN },
      { label: 'DPAD_LEFT', x: 20, y: 165, color: '#9E9E9E', index: remappedButtons.DPAD_LEFT },
      { label: 'DPAD_RIGHT', x: 80, y: 165, color: '#9E9E9E', index: remappedButtons.DPAD_RIGHT },
      { label: 'LT', x: 50, y: 50, color: '#9E9E9E', index: remappedButtons.LT },
      { label: 'RT', x: 350, y: 50, color: '#9E9E9E', index: remappedButtons.RT }
    ];

    buttonConfig.forEach((btn) => {
      const isPressed = gamepad.buttons[btn.index]?.pressed;
      const pressureLevel = gamepad.buttons[btn.index]?.value;

      // Dibujar botones con presión y color
      ctx.fillStyle = isPressed ? btn.color : '#E0E0E0';
      if (btn.label === 'DPAD_UP' || btn.label === 'DPAD_DOWN' || btn.label === 'DPAD_LEFT' || btn.label === 'DPAD_RIGHT') {
        ctx.beginPath();
        ctx.rect(btn.x, btn.y, 30, 30);
      } else {
        ctx.beginPath();
        ctx.arc(btn.x, btn.y, 15, 0, 2 * Math.PI);
      }
      ctx.fill();

      if (isPressed) {
        ctx.globalAlpha = pressureLevel;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        if (btn.label === 'DPAD_UP' || btn.label === 'DPAD_DOWN' || btn.label === 'DPAD_LEFT' || btn.label === 'DPAD_RIGHT') {
          ctx.beginPath();
          ctx.rect(btn.x, btn.y, 30 * (1 + pressureLevel), 30 * (1 + pressureLevel));
        } else {
          ctx.beginPath();
          ctx.arc(btn.x, btn.y, 15 * (1 + pressureLevel), 0, 2 * Math.PI);
        }
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText(btn.label, btn.x - 10, btn.y + 25);
    });

    // Sticks
    const sticks = [
      {
        label: 'Left Stick',
        baseX: 100,
        baseY: 150,
        axesX: 0,
        axesY: 1,
        color: '#673AB7'
      },
      {
        label: 'Right Stick',
        baseX: 250,
        baseY: 150,
        axesX: 2,
        axesY: 3,
        color: '#FF9800'
      }
    ];

    sticks.forEach(stick => {
      const stickX = stick.baseX + gamepad.axes[stick.axesX] * 30;
      const stickY = stick.baseY + gamepad.axes[stick.axesY] * 30;

      // Stick Base (Deadzone)
      ctx.fillStyle = '#E0E0E0';
      ctx.beginPath();
      ctx.arc(stick.baseX, stick.baseY, 30, 0, 2 * Math.PI);
      ctx.fill();

      // Stick Movement Range
      ctx.strokeStyle = '#BDBDBD';
      ctx.beginPath();
      ctx.arc(stick.baseX, stick.baseY, 30, 0, 2 * Math.PI);
      ctx.stroke();

      // Actual Stick Position
      ctx.fillStyle = stick.color;
      ctx.beginPath();
      ctx.arc(stickX, stickY, 15, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText(stick.label, stickX - 20, stickY + 25);
      ctx.fillText(`X: ${gamepad.axes[stick.axesX].toFixed(2)}`, stick.baseX - 30, stick.baseY + 50);
      ctx.fillText(`Y: ${gamepad.axes[stick.axesY].toFixed(2)}`, stick.baseX - 30, stick.baseY + 65);
    });

    // Triggers
    const triggers = [
      { label: 'L2', index: 6, x: 50, y: 50 },
      { label: 'R2', index: 7, x: 350, y: 50 }
    ];

    triggers.forEach(trigger => {
      const triggerValue = gamepad.buttons[trigger.index].value;

      ctx.fillStyle = triggerValue > 0 ? '#FF5722' : '#9E9E9E';
      ctx.fillRect(trigger.x, trigger.y, 20, 50 * triggerValue);

      ctx.strokeStyle = '#000';
      ctx.strokeRect(trigger.x, trigger.y, 20, 50);

      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.fillText(trigger.label, trigger.x, trigger.y + 65);
    });
  };

 const openRemapModal = () => {
  const gamepad = navigator.getGamepads()[0];
  if (!gamepad) {
    Swal.fire('No Gamepad Connected', 'Please connect a gamepad first.', 'warning');
    return;
  }

  // Generar opciones dinámicas para botones y ejes
  const buttonOptions = gamepad.buttons
    .map((_, index) => `<option value="button_${index}">Button ${index}</option>`)
    .join('');
  const axisOptions = gamepad.axes
    .map((_, index) => `<option value="axis_${index}">Axis ${index}</option>`)
    .join('');

  Swal.fire({
    title: 'Gamepad Mapping Options',
    html: `
      <div>
        <h3>Current Mapping</h3>
        <pre>${JSON.stringify(remapObj, null, 2)}</pre>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Advanced Remap',
    cancelButtonText: 'Close'
  }).then(result => {
    if (result.isConfirmed) {
      Swal.fire({
        title: 'Advanced Remapping',
        html: `
          <select id="targetType">
            <option value="buttons">Buttons</option>
            <option value="axes">Axes</option>
          </select>
          <select id="targetInput">
            ${buttonOptions}
            ${axisOptions}
          </select>
          <input id="valueInput" placeholder="New Value/Mapping">
          <div id="liveFeedback" style="margin-top: 10px; font-size: 12px; color: gray;">
            Press a button or move an axis to detect input.
          </div>
        `,
        didOpen: () => {
          const feedbackDiv = document.getElementById('liveFeedback');

          // Detectar entradas en tiempo real
          const detectInput = () => {
            const gp = navigator.getGamepads()[0];
            if (!gp) return;

            const pressedButtonIndex = gp.buttons.findIndex(button => button.pressed);
            if (pressedButtonIndex !== -1) {
              feedbackDiv.textContent = `Detected: Button ${pressedButtonIndex}`;
              document.getElementById('targetInput').value = `button_${pressedButtonIndex}`;
            } else {
              gp.axes.forEach((axis, index) => {
                if (Math.abs(axis) > 0.2) {
                  feedbackDiv.textContent = `Detected: Axis ${index}`;
                  document.getElementById('targetInput').value = `axis_${index}`;
                }
              });
            }

            requestAnimationFrame(detectInput);
          };

          detectInput();
        },
        preConfirm: () => {
          const targetType = document.getElementById('targetType').value;
          const target = document.getElementById('targetInput').value;
          const value = document.getElementById('valueInput').value;

          return { targetType, target, value };
        }
      }).then(remapResult => {
        if (remapResult.value) {
          const { targetType, target, value } = remapResult.value;

          // Procesar el valor de entrada
          const parsedValue = isNaN(value) ? JSON.parse(value) : parseInt(value);

          // Actualizar el mapeo
          setMapping({
            targetType,
            target
          }, parsedValue);

          Swal.fire('Mapping Updated', 'Your gamepad mapping has been updated.', 'success');
        }
      });
    }
  });
};


  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;

    const handleGamepadConnected = (e) => {
      console.log('Gamepad connected:', e.gamepad);
      setGamepadConnected(true);
    };

    const handleGamepadDisconnected = (e) => {
      console.log('Gamepad disconnected:', e.gamepad);
      setGamepadConnected(false);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    const update = () => {
      const gamepad = navigator.getGamepads()[0];
      drawControllerInputs(ctx, gamepad);

      requestAnimationFrame(update);
    };

    update();

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      padding: '20px'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          border: '2px solid #333',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      />
      <button
        onClick={openRemapModal}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Remap Buttons
      </button>
    </div>
  );
}


function ControllerVisualization() {
  const canvasRef = useRef(null);
  const [gamepadConnected, setGamepadConnected] = useState(false);

  const drawControllerInputs = (ctx, gamepad) => {
    // Clear the canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    if (!gamepad) {
      ctx.fillStyle = '#333';
      ctx.font = '20px Arial';
      ctx.fillText('Connect a gamepad', 10, 50);
      return;
    }

    // Controller Background
    ctx.fillStyle = '#F0F0F0';
    ctx.fillRect(10, 10, 380, 250);

    // Controller Outline
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 380, 250);

    // Detailed Button Positions
    const buttonConfig = [
      { label: 'A', x: 320, y: 180, color: '#4CAF50' },  // Green
      { label: 'B', x: 350, y: 150, color: '#F44336' }, // Red
      { label: 'X', x: 290, y: 150, color: '#2196F3' }, // Blue
      { label: 'Y', x: 320, y: 120, color: '#FFC107' }, // Yellow
    ];

    // Draw Buttons with Pressure Sensitivity
    buttonConfig.forEach((btn, index) => {
      const isPressed = gamepad.buttons[index].pressed;
      const pressureLevel = gamepad.buttons[index].value;

      // Button Base
      ctx.fillStyle = isPressed ? btn.color : '#E0E0E0';
      ctx.beginPath();
      ctx.arc(btn.x, btn.y, 15, 0, 2 * Math.PI);
      ctx.fill();

      // Pressure Visualization
      if (isPressed) {
        ctx.globalAlpha = pressureLevel;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(btn.x, btn.y, 15 * (1 + pressureLevel), 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Button Label
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText(btn.label, btn.x - 5, btn.y + 25);
    });

    // Analog Sticks with Enhanced Visualization
    const sticks = [
      {
        label: 'Left Stick',
        baseX: 100,
        baseY: 150,
        axesX: 0,
        axesY: 1,
        color: '#673AB7' // Purple
      },
      {
        label: 'Right Stick',
        baseX: 250,
        baseY: 150,
        axesX: 2,
        axesY: 3,
        color: '#FF9800' // Orange
      }
    ];

    sticks.forEach(stick => {
      const stickX = stick.baseX + gamepad.axes[stick.axesX] * 30;
      const stickY = stick.baseY + gamepad.axes[stick.axesY] * 30;

      // Stick Base (Deadzone)
      ctx.fillStyle = '#E0E0E0';
      ctx.beginPath();
      ctx.arc(stick.baseX, stick.baseY, 30, 0, 2 * Math.PI);
      ctx.fill();

      // Stick Movement Range
      ctx.strokeStyle = '#BDBDBD';
      ctx.beginPath();
      ctx.arc(stick.baseX, stick.baseY, 30, 0, 2 * Math.PI);
      ctx.stroke();

      // Actual Stick Position
      ctx.fillStyle = stick.color;
      ctx.beginPath();
      ctx.arc(stickX, stickY, 15, 0, 2 * Math.PI);
      ctx.fill();

      // Stick Label
      ctx.fillStyle = '#000';
      ctx.font = '12px Arial';
      ctx.fillText(stick.label, stickX - 20, stickY + 25);

      // Axes Values
      ctx.fillText(
        `X: ${gamepad.axes[stick.axesX].toFixed(2)}`,
        stick.baseX - 30,
        stick.baseY + 50
      );
      ctx.fillText(
        `Y: ${gamepad.axes[stick.axesY].toFixed(2)}`,
        stick.baseX - 30,
        stick.baseY + 65
      );
    });

    // Trigger Visualization
    const triggers = [
      { label: 'L2', index: 6, x: 50, y: 50 },
      { label: 'R2', index: 7, x: 350, y: 50 }
    ];

    triggers.forEach(trigger => {
      const triggerValue = gamepad.buttons[trigger.index].value;

      ctx.fillStyle = triggerValue > 0 ? '#FF5722' : '#9E9E9E';
      ctx.fillRect(trigger.x, trigger.y, 20, 50 * triggerValue);

      ctx.strokeStyle = '#000';
      ctx.strokeRect(trigger.x, trigger.y, 20, 50);

      ctx.fillStyle = '#000';
      ctx.font = '10px Arial';
      ctx.fillText(trigger.label, trigger.x, trigger.y + 65);
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = 400;
    canvas.height = 300;

    const handleGamepadConnected = (e) => {
      console.log('Gamepad connected:', e.gamepad);
      setGamepadConnected(true);
    };

    const handleGamepadDisconnected = (e) => {
      console.log('Gamepad disconnected:', e.gamepad);
      setGamepadConnected(false);
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    const update = () => {
      const gamepad = navigator.getGamepads()[0];
      drawControllerInputs(ctx, gamepad);

      requestAnimationFrame(update);
    };

    update();

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, []);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      padding: '20px'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          border: '2px solid #333',
          borderRadius: '10px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );
}

function KeySettings({ keyConfigs, setKeyConfig }) {
  const mappableButtons = ['DPadUp', 'DPadDown', 'DPadLeft', 'DPadRight', 'A', 'B', 'X', 'Y', 'View', 'Menu', 'Nexus', 'LeftShoulder', 'RightShoulder', 'LeftTrigger', 'RightTrigger', 'LeftThumb', 'RightThumb']
  // console.log('KEYS:', keyConfigs, mappableButtons)
  // console.log('Initial keyConfigs:', keyConfigs);
  // console.log('Inverted keyConfigs:', invert(keyConfigs));

  keyConfigs = invert(keyConfigs)
  return <p>
    {
      mappableButtons.map(
        (btn: string) => {
          let fullBtnText = ''

          switch (btn) {
            case 'DPadUp':
              fullBtnText = 'DPad Up'
              break
            case 'DPadDown':
              fullBtnText = 'DPad Down'
              break
            case 'DPadLeft':
              fullBtnText = 'DPad Left'
              break
            case 'DPadRight':
              fullBtnText = 'DPad Right'
              break
            case 'LeftShoulder':
              fullBtnText = 'Left Shoulder'
              break
            case 'RightShoulder':
              fullBtnText = 'Right Shoulder'
              break
            case 'LeftTrigger':
              fullBtnText = 'Left Trigger'
              break
            case 'RightTrigger':
              fullBtnText = 'Right Trigger'
              break
            case 'LeftThumb':
              fullBtnText = 'Left Thumbstick'
              break
            case 'RightThumb':
              fullBtnText = 'Right Thumbstick'
              break
            default:
              fullBtnText = btn
              break
          }

          return <p key={btn}>
            <label>{fullBtnText}</label>
            <label style={{ minWidth: 0 }}>
              <input type='text' className='text' onKeyUp={(e) => setKeyConfig(btn, e)} value={keyConfigs[btn] ?? 'None'} />
            </label>
          </p>
        }
      )
    }
  </p>
}

function SettingsInput() {
  const { settings, setSettings } = useSettings()
  const [controllerPing, setControllerPing] = React.useState(0)

  const [controllerKeys, setControllerKeys] = React.useState(settings.input_mousekeyboard_config)

  React.useEffect(() => {
    // console.log('Last controller check:', controllerPing)
    const controllerInterval = setInterval(() => {
      setControllerPing(Date.now())
    }, 1000)

    return () => {
      clearInterval(controllerInterval)
    }
  })

  function setControllerVibration() {
    setSettings({
      ...settings,
      controller_vibration: (!settings.controller_vibration),
    })
  }

  function setTouchInput() {
    setSettings({
      ...settings,
      input_touch: (!settings.input_touch),
    })
  }

  function setMKBInput() {
    setSettings({
      ...settings,
      input_mousekeyboard: (!settings.input_mousekeyboard),
    })
  }

  function setLegacyInput() {
    setSettings({
      ...settings,
      input_newgamepad: (!settings.input_newgamepad),
    })
  }

  function setKeyConfig(button: string, event) {
    let ckeys = controllerKeys
    if (ckeys === undefined) {
      ckeys = {} as any
    }


    for (const ckeysKey of Object.keys(ckeys)) {
    }
      if (ckeys[ckeysKey] === button) delete ckeys[ckeysKey]

    if (event.key !== 'Escape')
      ckeys[event.key] = button

    setControllerKeys(ckeys)

    event.target.blur()

    setSettings({
      ...settings,
      input_mousekeyboard_config: ckeys,
    })
  }

  return (
    <React.Fragment>
      <Head>
        <title>Greenlight - Settings: Input</title>
      </Head>

      <SettingsSidebar>
        <Card>
          <h1>Input</h1>

          <p>
            <label>Enable vibration</label>
            <label style={{ minWidth: 0 }}>
              <input type='checkbox' onChange={setControllerVibration} checked={settings.controller_vibration} />&nbsp; ({settings.controller_vibration ? 'Enabled' : 'Disabled'})
            </label>
          </p>

          <p>
            <label>Enable Touch input</label>
            <label style={{ minWidth: 0 }}>
              <input type='checkbox' onChange={setTouchInput} checked={settings.input_touch} />&nbsp; ({settings.input_touch ? 'Enabled' : 'Disabled'})
            </label>
          </p>

          <p>
            <label>Enable Mouse & Keyboard</label>
            <label style={{ minWidth: 0 }}>
              <input type='checkbox' onChange={setMKBInput} checked={settings.input_mousekeyboard} />&nbsp; ({settings.input_mousekeyboard ? 'Enabled' : 'Disabled'})
            </label> <br />
            {(!settings.input_newgamepad && settings.input_mousekeyboard) ? <small style={{ color: 'orange' }}>Using the Mouse & Keyboard driver together with the Gamepad keyboard mappings will cause conflicts</small> : ''}
          </p>

          <p>
            <label>Enable Keyboard to Gamepad</label>
            <label style={{ minWidth: 0 }}>
              <input type='checkbox' onChange={setLegacyInput} checked={!settings.input_newgamepad} />&nbsp; ({!settings.input_newgamepad ? 'Enabled' : 'Disabled'})
            </label><br />
            <small>(Disabling this feature will disable the keyboard to gamepad mapping and only allows controls from the gamepad.)</small>
          </p>
        </Card>

        <Card>
          <h1>Controllers detected</h1>

          <p>
            If you have a controller connected but it is not showing up, try to press a button on the controller to detect it.
          </p>

          <div>
            {
              navigator.getGamepads().map((item, index) => {
                return (
                  <p key={index}>
                    #{index + 1} &nbsp;

                    {(item) ?
                      item.id + ' axes: ' + item.axes.length + ', buttons: ' + item.buttons.length + ', rumble: ' + ((item.vibrationActuator !== null) ? item.vibrationActuator.type : 'Not supported')
                      : 'No controller detected'
                    }
                  </p>
                )
              })
            }
          </div>
        </Card>

        <Card>
          <ControllerVisualization />
        </Card>

        <Card>
          <RemapController />
        </Card>

        <Card hidden={settings.input_newgamepad}>
          <h1>Keyboard mappings</h1>
          <p>
            {
              <KeySettings keyConfigs={controllerKeys} setKeyConfig={setKeyConfig} />
            }
          </p>
        </Card>
      </SettingsSidebar>


    </React.Fragment>
  )
}

export default SettingsInput
