import $ from 'jquery';

function fadeIn(element: HTMLAudioElement, duration: number) {
  $(element).animate({ volume: 1 }, duration);
}

function fadeOut(element: HTMLAudioElement, duration: number) {
  $(element).animate({ volume: 0 }, duration);
}
