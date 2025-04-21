FROM rust:1.86-alpine as builder

WORKDIR /usr/src/app

RUN apk update && apk add --no-cache alpine-sdk pkgconf openssl-dev clang

WORKDIR /usr/src/app
RUN USER=root cargo new --bin app
WORKDIR /usr/src/app/app
COPY ./Cargo.toml ./Cargo.lock ./
RUN cargo build --release
RUN rm src/*.rs
COPY ./src ./src
RUN rm ./target/release/deps/rust_query_api* && cargo build --release

FROM alpine:latest

RUN apk update && apk add --no-cache libssl3

WORKDIR /usr/local/bin

COPY --from=builder /usr/src/app/app/target/release/rust_query_api .

EXPOSE 8080

CMD ["./rust_query_api"]