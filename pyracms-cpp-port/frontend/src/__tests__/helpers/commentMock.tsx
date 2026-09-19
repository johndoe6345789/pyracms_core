/** Stand-in for the shared CommentSection in page-level tests. */
export const commentSectionMock = () => ({
  __esModule: true,
  default: (p: { contentType: string; contentId: number }) => (
    <div data-testid={`comments-${p.contentType}-${p.contentId}`} />
  ),
})
