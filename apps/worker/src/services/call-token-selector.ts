export type CallTokenItem = {
	id: string;
	channel_id: string;
	name: string;
	api_key: string;
};

export const selectCallToken = (
	tokens: CallTokenItem[],
): CallTokenItem | null => {
	if (tokens.length === 0) {
		return null;
	}
	return tokens[0];
};
