'use client';

import Spline from '@splinetool/react-spline';
// import { useCallback, useEffect, useRef } from 'react';
// import { Application } from '@splinetool/runtime';

export default function KeyboardGUI() {
  // const onLoad = useCallback((spline: Application) => {
  //   spline.addEventListener('mouseDown', (e) => {
  //     if (e.target.name) {
  //       console.log(`Clicked on: ${e.target.name}`);
  //       // Add your click handling logic here
  //     }
  //   });
  // }, []);

  // const splineRef = useRef(null);

  // // Function to handle mouse events
  // const handleMouseEvents = (event) => {
  //   switch (event.type) {
  //     case 'mouseHover':
  //       triggerEvent('mouseDown', event.objectId);
  //       console.log('Mouse Hovered');
  //       break;
  //     case 'mouseDown':
  //       console.log('Mouse Down');
  //       break;
  //     case 'mouseUp':
  //       console.log('Mouse Up');
  //       break;
  //     default:
  //       console.log('Unknown event');
  //   }
  // };

  // const triggerEvent = (eventType, objectId) => {
  //   if (splineRef.current) {
  //     splineRef.current.emitEvent(eventType, objectId);
  //     console.log('Event triggered: ', eventType, ' on object: ', objectId);
  //   }
  // };

  return (
    <>
      <Spline
        scene='https://prod.spline.design/wCAtWgLMbgQHkLui/scene.splinecode'
        // onLoad={(spline) => {
        //   splineRef.current = spline;
        //   console.log('Spline loaded');
        //   spline.addEventListener('mouseHover', handleMouseEvents);
        //   spline.addEventListener('mouseDown', handleMouseEvents);
        //   spline.addEventListener('mouseUp', handleMouseEvents);
        // }}
      />
    </>
  );
}

/* <Spline scene="https://prod.spline.design/6LVJIfCH1KYHCxND/scene.splinecode" /> */
