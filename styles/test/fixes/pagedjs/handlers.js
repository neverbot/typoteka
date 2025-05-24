class RemoveSpanInH1Handler extends Paged.Handler {
  constructor(chunker, polisher, caller) {
    super(chunker, polisher, caller);
  }

  // afterPageLayout(pageFragment, page) {
  //   console.log(pageFragment);
  // }

  layoutNode(node) {
    // remove the span inside every h1 element, 
    // as its contents would be rendered on every
    // page header
    if (node.nodeName === 'H1') {
      node.children[0].remove()
      console.log(node)
    }
  }
}

Paged.registerHandlers(RemoveSpanInH1Handler);
