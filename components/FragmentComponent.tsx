function AnotherComponent() {
  return (
    <Fragment key={2}>
      <p>Another Fragment</p>
    </Fragment>
  );
}

function FragmentComponent() {
  return (
    <>
      <p>Fragment</p>
      <AnotherComponent />
    </>
  );
}

export default FragmentComponent;
