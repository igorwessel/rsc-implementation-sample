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
      <hr />
      <AnotherComponent />
      <hr />
    </>
  );
}

export default FragmentComponent;
