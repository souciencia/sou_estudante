/**
 * Constrói o href do perfil da IES. Quando há um curso de origem, preserva o id
 * na query string (`?curso=`) para que o usuário consiga voltar aos perfis do
 * mesmo curso após navegar para a instituição.
 */
export function buildIesHref(iesId: string, courseId?: number): string {
  return courseId !== undefined
    ? `/ies/${iesId}?curso=${courseId}`
    : `/ies/${iesId}`
}
