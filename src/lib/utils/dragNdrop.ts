export const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
};

export const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
  e.preventDefault();
  e.stopPropagation();
  //setAudioSrcUrl('');

  const files = e.dataTransfer.files;
  filesToAudioBuffer(files);
};

export const filesToAudioBuffer = (files: FileList) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.type.startsWith('audio/')) {
      //const audioUrl = URL.createObjectURL(file);
      //setAudioSrcUrl(audioUrl);
      console.log('Audio file dropped:', file.name);
    } else {
      console.log('Unsupported file dropped:', file.name);
    }
  }
};

// onDragEnter={handleDragEnter} // nota í visual
// onDragLeave={handleDragLeave}
// onDragEnd={handleDragEnd}

// const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
//   e.preventDefault();
// };

// const handleDragLeave = () => {};

// const handleDragEnd = () => {
// };

// interface DropZoneProps {
//   children: React.ReactNode;
// }

// { children }: DropZoneProps)

// {React.Children.map(children, (child) => {
//   if (React.isValidElement(child)) {
//     const ChildComponent = child.type as React.ComponentType<any>;
//     return <ChildComponent {...child.props} droppedAudioUrl={audioUrl} />;
//   }
//   return child;
// })}
// {/* {children} */}
