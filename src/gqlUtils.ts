import { GraphQLResolveInfo, SelectionNode } from 'graphql';

export function getFields(info: GraphQLResolveInfo): string[] {
  // TODO: handle all field nodes in other fragments
  const nodes = info.fieldNodes ?? [];
  const sels = nodes[0] ? nodes[0].selectionSet.selections : [];
  return sels.map(
    // SelectionNode: FieldNode | FragmentSpreadNode | InlineFragmentNode
    (sel: SelectionNode) => {
      // TODO: handle fragments
      if ('name' in sel && 'value' in sel.name) return sel.name.value;
      return null;
    }
  ).filter(n => n !== null);
}
