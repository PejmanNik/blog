---
title: "Lazvard Message"
description: "lightweight AMQP server - Azure Service Bus simulator."
date: "Jun 6 2023"
demoURL: "#"
repoURL: "https://github.com/PejmanNik/lazvard-message"
---

Lazvard Message is an AMQP server simulator that is unofficially compatible with Azure Service Bus.

## ⚠️ Different behavior
In addition to the standard AMQP protocol, the simulator's behavior largely relies on reverse engineering the Azure Service Bus client library and test suite. As a result, it is possible to encounter varying behaviors between the simulator and the actual Service Bus. If you come across any inconsistency, please create an issue with a failed test case or at least provide a sample code illustrating the misbehavior.