import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Post, CreatePostInput } from "../entities/post";
import { PostModel } from "../entities/models";

@Resolver()
export class PostResolver {
	@Query(() => Post, { nullable: true })
	async postByPostId(
		@Arg("postId") postId: string,
		@Arg("populateComments") populate: boolean
	): Promise<Post | null> {
		if (populate) return await PostModel.findById(postId).populate("comments");
		return await PostModel.findOne({ _id: postId });
	}

	@Query(() => Post, { nullable: true })
	async postByUserId(@Arg("userId") userId: string): Promise<Post | null> {
		return await PostModel.findOne({ "author._id": userId });
	}

	@Query(() => [Post])
	async posts(@Arg("limit", { defaultValue: 10 }) limit: number): Promise<Post[] | null> {
		return await PostModel.find().sort({ $natural: -1 }).limit(limit);
		// return await PostModel.find().populate("author._id");
	}

	@Mutation(() => Post)
	async createPost(@Arg("PostInput") PostInput: CreatePostInput): Promise<Post | null> {
		return await PostModel.create(PostInput);
	}

	@Mutation(() => Boolean)
	async deletePost(@Arg("id", () => String) id: string): Promise<boolean> {
		const post = await PostModel.deleteOne({ _id: id });
		if (post) return true;
		else return false;
	}

	@Mutation(() => Boolean)
	async updatePost(
		@Arg("id", () => String) id: string,
		@Arg("PostInput") PostInput: CreatePostInput
	): Promise<boolean> {
		const post = await PostModel.updateOne({ _id: id }, PostInput);
		if (post) return true;
		else return false;
	}

	@Mutation(() => Post)
	async likePost(
		@Arg("id", () => String) id: string,
		@Arg("userId", () => String) userId: string
	): Promise<Post | null> {
		const query = { _id: id, likedByUsers: { $ne: userId } };
		const update = { $inc: { likesCount: 1 }, $push: { likedByUsers: userId } };
		const options = { new: true };

		return await PostModel.findOneAndUpdate(query, update, options);
	}

	@Mutation(() => Post)
	async unlikePost(
		@Arg("id", () => String) id: string,
		@Arg("userId", () => String) userId: string
	): Promise<Post | null> {
		const query = { _id: id, likedByUsers: userId };
		const update = { $inc: { likesCount: -1 }, $pull: { likedByUsers: userId } };
		const options = { new: true };

		return await PostModel.findOneAndUpdate(query, update, options);
	}
}
