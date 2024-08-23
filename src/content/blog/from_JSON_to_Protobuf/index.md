---
title: "From JSON to Protobuf"
description: "comparing JSON vs Protobuf"
date: "8 20 2024"
draft: false
---

Because Who Needs Readability Anyway?

![captionless image](./title.jpg)

In [Sievo](https://sievo.com/), one of the first requirements in our software architecture is considering the volume of data, as we process vast datasets from various sources for each customer.

Sievo grants full technical authority to the teams. Historically, my team has used JSON to serialize these large datasets in asynchronous communication between our services.

For instance in asynchronous communication, Service A writes the request data in JSON format to a file in our object storage and sends a message to Service B. Service B reads the input file, processes it, and creates a new JSON file for the response. Once completed, it sends a message back to Service A.

# 🤦‍♂️Drawbacks

## Type Safety

One caveat in this design is type safety. JSON is a loosely typed format, This flexibility can lead to common pitfalls with runtime errors and data corruption.

Even when you are using the same language across services and sharing the domain model, bugs can still crash the party uninvited. For instance, we had an incident where a property was null due to a bug in the calculation. This caused a failure in the consumer service, which couldn’t handle the null value, and the root cause was hidden behind the deserialization exception.

As there is no schema validation, you could serialize some properties with `decimal`type but JSON will convert it to a standard number, This conversion can go unnoticed, potentially leading to incorrect values in your data.

## Compatibility

The second issue is compatibility. You have to carefully manage changes in the data schema, as Service A might be using schema V2 for serialization while Service B is still using schema V1 for deserialization.

JSON, by its nature, lacks inherent forward or backward compatibility. Compatibility largely depends on the tools you use. However, due to JSON’s dynamic structure, adding, removing, or modifying a field can easily result in deserialization errors.

## Performance

Because of JSON's text-based nature and the need for parsing and serialization. When processing large volumes of data, the time it takes to convert JSON strings to native data structures and vice versa can become significant.

JSON is a verbose format, where even simple data structures can result in large text files, adds to the processing time and increases the amount of data that needs to be transmitted.

lack of support for more complex data types and binary data in JSON can require additional encoding and decoding steps, further slowing down the process.

In certain critical areas of our system, we had to implement a custom JSON serializer for specific data types to enhance performance. While this approach did improve efficiency, it made the codebase more complex and difficult to maintain.

Additionally, to reduce file sizes, we resorted to using custom, shortened names for properties, often replacing them with 2–3 letter synonyms. This might seem extreme, but when dealing with large volumes of data, even small optimizations like these can have a noticeable impact on overall performance.

# 🚀 Moving On from JSON

Recently, we had to implement a new service. Based on my experience with our data schema and JSON, I decided to try binary formats. Certainly, there are several alternatives to JSON, and the decision should be made by considering various aspects of your requirements.

## Why Protobuf?

.NET has a built-in binary format, but due to several security issues, it has been deprecated and will soon be removed. “At Microsoft, many teams have transitioned from `BinaryFormatter` to `ProtoBuf`“ [[ref](https://github.com/dotnet/announcements/issues/293)].

Protocol Buffers, or Protobuf, is an open-source binary format created by Google that supports most common programming languages.

It has been widely adopted by the community, actively maintained [[ref](https://github.com/protocolbuffers/protobuf/commits/main/)], and used in many projects within Google [[ref](https://protobuf.dev/history/)], Reducing the likelihood that the project will be abandoned in a few years. compared to other alternatives like `FlatBuffers` and `Cap’n Proto` which offer better performance and lower memory usage.

Protobuf is strongly typed, backward and forward compatible, and offers promising performance along with very low memory allocation. [[ref](https://blog.devgenius.io/serialization-performance-in-net-json-bson-protobuf-avro-a25e8207d9de)]. Also at least to my taste, Protobuf is more developer-friendly.

## Type Safety

In Protobuf, type safety is a fundamental feature, ensured by the strongly-typed nature of the schema. You pay the upfront cost of defining the Protobuf schema, and then the compiler generates code that enforces these types at both compile-time and run-time.

In the case of missing or null values, the deserialized object’s property will be set to the default value.

Due to Protobuf’s cross-language compatibility, type safety is guaranteed in any consumer service, regardless of the programming language.

## Compatibility

Protobuf is backward and forward compatible. The compatibility rules are very simple and straightforward, allowing you to [almost freely](https://protobuf.dev/programming-guides/dos-donts/) rename, add, or remove fields.

During deserialization, Protobuf provides `unknown fields`, which contain fields that the parser does not recognize. These can be beneficial tools for handling breaking changes and eliminating service release dependencies, as you can safely handle changes in the model from the consumer service before releasing the provider service.

Like everything good in life, it often fades just when we start to enjoy it. the `oneof` fields can cause complications in compatibility [[ref](https://yokota.blog/2021/08/26/understanding-protobuf-compatibility/)].

## Performance

Performance is not just a secondary concern; it is a critical aspect of system design, though it is not the only aspect. I generally disagree with the notion that “You shouldn’t pay for performance until you actually need it.”

> Performance is a feature. If your software doesn’t perform well, it doesn’t matter how many other features it has.
> — Casey Muratori

I created a benchmark using .Net 8 and [BenchmarkDotNet](https://github.com/dotnet/BenchmarkDotNet) to test how performance changes with varying data amounts and schema similar to what we will use in production.

The table below shows the results of serializing/deserializing 500,000 objects with nested properties and storing them in a local file. For JSON, I used `new line`, and for Protobuf, I used the [length-delimited](https://github.com/protocolbuffers/protobuf/issues/10229) method as the separator.


| Method                |     Mean |    Error |   StdDev | Total Allocations | Total Size (Bytes) | File Size |
| --------------------- | -------: | -------: | -------: | ----------------: | -----------------: | --------: |
| SerializeJson         |  4.499 s | 0.0839 s | 0.0744 s |         1,501,447 |        464,272,900 |   1.80 GB |
| SerializeJsonWithSG   |  3.682 s | 0.0709 s | 0.0947 s |               416 |            221.224 |   1.80 GB |
| SerializeProtobuf     |  2.320 s | 0.0451 s | 0.0617 s |           699,293 |        226,949,420 |   1.43 GB |
| DeserializeJson       | 10.437 s | 0.2080 s | 0.2395 s |        22,401,401 |      2,846,206,172 |           |
| DeserializeJsonWithSG | 10.656 s | 0.2107 s | 0.2342 s |         28,812260 |      3,658,236,620 |           |
| DeserializeProtobuf   |  2.146 s | 0.0232 s | 0.0206 s |         1,507,590 |        262,965,604 |           |

The allocation report from BenchmarkDotNet didn't make sense, so I used the Visual Studio Performance Profiler instead. 

The `SerializeJsonWithSG` and `DeserializeJsonWithSG` methods use the new [source generator for System.Text.Json](https://learn.microsoft.com/en-us/dotnet/standard/serialization/system-text-json/source-generation?pivots=dotnet-8-0) which enhances performance and memory allocation. This feature was introduced in the .Net 6 and C# 9.

The results show that by switching from JSON (with source generator context) to Protobuf, we can improve the processing time by 69% and reduce memory allocation by 86.6%.

## Soft Challenges

Introducing a new technology to a project isn’t just a matter of technicality, it’s also about selling the idea to your colleagues. Sometimes, it’s not as straightforward as comparing benchmarks, and the conversation starts with the classic “I don’t like it” and goes downhill from there!

Being open and maintaining clear communication can help find common ground. Ultimately, every design decision boils down to weighing cost versus benefit, and there’s no such thing as a one-size-fits-all ‘best’ option.

One notable point that emerged during these conversations is that it can make the service harder to debug and inspect, as the generated files are no longer human-readable.

## Protobuf is not Human Readability

Each time we need to inspect a file, we’ll have to spend additional time converting the Protobuf data file to a readable text format using the `protoc` CLI or other tooling.

It is a significant challenge and a serious reason to avoid using binary formats, but everything has a downside, like finding out the ‘perfect’ job comes with a boss who thinks ‘fun’ means mandatory karaoke _(not my boss 😁)._

As a true engineer, after inventing the problem, I set out to solve it. We needed a tool that could decode large encoded files (even in the gigabyte range) based on Protobuf definitions, handle imports and well-known types from Google, and enable searching within these files.

> Software engineers creating their own problems and solving them just to stay employed!

My simplest and fastest solution was to create a fully client-side web app. This app wouldn’t require any installation, and with the new File API, I could maintain access to the proto definitions files, eliminating the need to upload them every time.

![protolens](https://miro.medium.com/v2/resize:fit:2000/format:webp/1*4CFFAGxvjJgx7YDDh_bKuA.gif)

The result was quite satisfactory and has already helped us debug several issues in the project. I have published the source code on GitHub:

[https://github.com/PejmanNik/protolens](https://github.com/PejmanNik/protolens)
