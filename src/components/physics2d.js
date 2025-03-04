"use client";

import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export const Physics2D = () => {
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!sceneRef.current) return;
    let { clientWidth: width, clientHeight: height } = sceneRef.current;
    const {
      Engine,
      Render,
      Runner,
      Composite,
      Bodies,
      Mouse,
      MouseConstraint,
      Events,
    } = Matter;

    // エンジン・レンダラー・ランナーの作成
    const engine = Engine.create();
    const { world } = engine;
    const render = Render.create({
      element: sceneRef.current,
      engine,
      options: {
        width,
        height,
        showAngleIndicator: false,
        wireframes: false,
        background: 'white',
      },
    });
    Render.run(render);
    render.canvas.style.backgroundColor = 'white';
    const runner = Runner.create();
    Runner.run(runner, engine);

    // 壁生成用の関数
    const createWalls = (w, h) => {
      const wallThickness = 50;
      return [
        Bodies.rectangle(w / 2, -wallThickness / 2, w, wallThickness, {
          isStatic: true,
          render: { visible: false },
        }),
        Bodies.rectangle(w / 2, h + wallThickness / 2, w, wallThickness, {
          isStatic: true,
          render: { visible: false },
        }),
        Bodies.rectangle(-wallThickness / 2, h / 2, wallThickness, h, {
          isStatic: true,
          render: { visible: false },
        }),
        Bodies.rectangle(w + wallThickness / 2, h / 2, wallThickness, h, {
          isStatic: true,
          render: { visible: false },
        }),
      ];
    };

    // 初期の壁作成
    let wallBodies = createWalls(width, height);
    Composite.add(world, wallBodies);

    // 文字オブジェクト生成用の定数
    const textString =
      "Hello, World! Hello, World! Hello, World! Hello, World! Hello, World!, World! Hello, World! Hello, World!, World! Hello, World! Hello, World!, World! Hello, World! Hello, World!, World! Hello, World! Hello, World!, World! Hello, World! Hello, World!, World! Hello, World! Hello, World!, World! Hello, World! Hello, World!";
    const startX = 50;
    const startY = 50;
    const letterSpacing = 10;
    const fontSize = 24;
    const fontFamily = "Arial";
    const lineHeight = fontSize + letterSpacing;
    const physicsScale = 0.7;

    // オフスクリーンcanvasで文字幅を測定
    const measureCanvas = document.createElement("canvas");
    const measureContext = measureCanvas.getContext("2d");
    measureContext.font = `${fontSize}px ${fontFamily}`;

    // 文字の物理オブジェクトを生成する関数
    const createLetterBodies = () => {
      const bodies = [];
      let currentX = startX;
      let currentY = startY;

      for (let char of textString) {
        if (char === " ") {
          const spaceWidth = fontSize / 2;
          if (currentX + spaceWidth + letterSpacing > width) {
            currentX = startX;
            currentY += lineHeight;
          } else {
            currentX += spaceWidth + letterSpacing;
          }
          continue;
        }
        const letterWidth = measureContext.measureText(char).width;
        const diameter = Math.max(letterWidth, fontSize);
        const radius = (diameter / 2) * physicsScale;
        if (currentX + diameter > width) {
          currentX = startX;
          currentY += lineHeight;
        }
        const body = Bodies.circle(currentX + radius, currentY, radius, {
          label: char,
          restitution: 0.5,
          render: { fillStyle: 'transparent', strokeStyle: 'transparent' },
        });
        // 幅情報をプロパティとして保持
        body.letterWidth = letterWidth;
        bodies.push(body);
        currentX += diameter + letterSpacing;
      }
      return bodies;
    };

    const letterBodies = createLetterBodies();
    Composite.add(world, letterBodies);

    // 画面中央に大きな円を追加
    const largeCircle = Bodies.circle(width / 2, height / 2, 100, {
      label: 'Large Circle',
      restitution: 0.5,
      render: { fillStyle: 'lightblue', strokeStyle: 'black' },
    });
    Composite.add(world, largeCircle);

    // マウス操作の追加
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    Composite.add(world, mouseConstraint);
    render.mouse = mouse;

    Render.lookAt(render, { min: { x: 0, y: 0 }, max: { x: width, y: height } });

    // afterRenderイベントで各物体に文字を描画
    Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      ctx.fillStyle = 'black';
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      letterBodies.forEach(body => {
        ctx.fillText(body.label, body.position.x, body.position.y);
      });
      ctx.fillText(largeCircle.label, largeCircle.position.x, largeCircle.position.y);
    });

    // ウィンドウのリサイズに対応
    const handleResize = () => {
      if (!sceneRef.current) return;
      // 新しい幅と高さを取得
      width = sceneRef.current.clientWidth;
      height = sceneRef.current.clientHeight;
      
      // レンダラーのオプションとキャンバスサイズを更新
      render.options.width = width;
      render.options.height = height;
      render.canvas.width = width;
      render.canvas.height = height;
      Render.lookAt(render, { min: { x: 0, y: 0 }, max: { x: width, y: height } });

      // 既存の壁を削除し、新たに生成
      wallBodies.forEach(wall => Composite.remove(world, wall));
      wallBodies = createWalls(width, height);
      Composite.add(world, wallBodies);
    };

    window.addEventListener('resize', handleResize);

    // クリーンアップ処理
    return () => {
      window.removeEventListener('resize', handleResize);
      Render.stop(render);
      Runner.stop(runner);
    };
  }, []);

  return <div ref={sceneRef} className="absolute top-0 size-full" />;
};
