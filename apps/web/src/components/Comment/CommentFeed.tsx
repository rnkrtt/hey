import { useHiddenCommentFeedStore } from "@/components/Post";
import SinglePost from "@/components/Post/SinglePost";
import PostsShimmer from "@/components/Shared/Shimmer/PostsShimmer";
import { Card, EmptyState, ErrorMessage } from "@/components/Shared/UI";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import {
  PageSize,
  PostReferenceType,
  type PostReferencesRequest,
  PostVisibilityFilter,
  ReferenceRelevancyFilter,
  type ReferencedPostFragment,
  usePostReferencesQuery
} from "@hey/indexer";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import { useEffect } from "react";
import { WindowVirtualizer } from "virtua";

interface CommentFeedProps {
  postId: string;
}

const CommentFeed = ({ postId }: CommentFeedProps) => {
  const { showHiddenComments } = useHiddenCommentFeedStore();
  const [ref, entry] = useIntersectionObserver({
    threshold: 0,
    root: null,
    rootMargin: "0px"
  });

  const request: PostReferencesRequest = {
    pageSize: PageSize.Fifty,
    referencedPost: postId,
    referenceTypes: [PostReferenceType.CommentOn],
    relevancyFilter: ReferenceRelevancyFilter.Relevant,
    visibilityFilter: showHiddenComments
      ? PostVisibilityFilter.Hidden
      : PostVisibilityFilter.Visible
  };

  const { data, error, fetchMore, loading } = usePostReferencesQuery({
    skip: !postId,
    variables: { request }
  });

  const comments =
    (data?.postReferences?.items as ReferencedPostFragment[]) ?? [];
  const pageInfo = data?.postReferences?.pageInfo;
  const hasMore = pageInfo?.next;

  const onEndReached = async () => {
    if (hasMore) {
      await fetchMore({
        variables: { request: { ...request, cursor: pageInfo?.next } }
      });
    }
  };

  useEffect(() => {
    if (entry?.isIntersecting) {
      onEndReached();
    }
  }, [entry?.isIntersecting]);

  if (loading) {
    return <PostsShimmer />;
  }

  if (error) {
    return <ErrorMessage error={error} title="Failed to load comment feed" />;
  }

  if (!comments?.length) {
    return (
      <EmptyState
        icon={<ChatBubbleLeftIcon className="size-8" />}
        message="Be the first one to comment!"
      />
    );
  }

  const filteredComments = comments.filter(
    (comment) =>
      !comment.author.operations?.hasBlockedMe &&
      !comment.author.operations?.isBlockedByMe &&
      !comment.operations?.hasReported &&
      !comment.isDeleted
  );

  return (
    <Card className="virtual-divider-list-window">
      <WindowVirtualizer>
        {filteredComments.map((comment) => (
          <SinglePost key={comment.id} post={comment} showType={false} />
        ))}
        {hasMore && <span ref={ref} />}
      </WindowVirtualizer>
    </Card>
  );
};

export default CommentFeed;
