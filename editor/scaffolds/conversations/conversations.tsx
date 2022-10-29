import React from "react";

import { useEditorState } from "core/states";
import { useFigmaAccessToken } from "hooks/use-figma-access-token";
import styled from "@emotion/styled";

import { useFigmaComments } from "services/figma-comments-service";
import { TopLevelComment } from "./comment";
import { copy } from "utils/clipboard";

export function Conversations() {
  const [state] = useEditorState();
  const fat = useFigmaAccessToken();
  const filekey = state.design?.key;

  const [comments, dispatch] = useFigmaComments(filekey, {
    personalAccessToken: fat.personalAccessToken,
    accessToken: fat.accessToken.token,
  });

  return (
    <>
      <CommentsListContainer>
        {comments.map((c) => {
          return (
            <TopLevelComment
              key={c.id}
              {...c}
              readonly={false}
              onReply={(message) => {
                dispatch({ type: "post", message, comment_id: c.id });
              }}
              onCopyLink={(id) => {
                const url = `https://www.figma.com/file/${filekey}?#${id}`;
                copy(url, { notify: true });
              }}
              onDelete={(id) => {
                dispatch({ type: "delete", comment_id: id });
              }}
              onReaction={(id, emoji) => {
                dispatch({ type: "react", comment_id: id, emoji });
              }}
            />
          );
        })}
      </CommentsListContainer>
    </>
  );
}

const CommentsListContainer = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;

  div:first-child {
    border-top: none;
  }
`;
