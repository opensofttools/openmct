/*global define,Promise,describe,it,expect,beforeEach,waitsFor,jasmine*/

/**
 * MergeModelsSpec. Created by vwoeltje on 11/6/14.
 */
define(
    ["../../src/elements/PlotLineBuffer"],
    function (PlotLineBuffer) {
        "use strict";

        var TEST_INITIAL_SIZE = 10,
            TEST_MAX_SIZE = 40,
            TEST_DOMAIN_OFFSET = 42;

        describe("A plot line buffer", function () {
            var mockSeries,
                testDomainValues,
                testRangeValues,
                buffer;

            beforeEach(function () {
                testDomainValues = [ 1, 3, 7, 9, 14, 15 ];
                testRangeValues = [ 8, 0, 3, 9, 8, 11 ];
                mockSeries = jasmine.createSpyObj(
                    "series",
                    ['getPointCount', 'getDomainValue', 'getRangeValue']
                );
                mockSeries.getPointCount.andCallFake(function () {
                    return testDomainValues.length;
                });
                mockSeries.getDomainValue.andCallFake(function (i) {
                    return testDomainValues[i];
                });
                mockSeries.getRangeValue.andCallFake(function (i) {
                    return testRangeValues[i];
                });

                buffer = new PlotLineBuffer(
                    TEST_DOMAIN_OFFSET,
                    TEST_INITIAL_SIZE,
                    TEST_MAX_SIZE
                );

                // Start with some data in there
                buffer.insert(mockSeries, 0);
            });

            it("allows insertion of series data", function () {
                // Convert to a regular array for checking.
                // Verify that domain/ranges were interleaved and
                // that domain offset was adjusted for.
                expect(
                    Array.prototype.slice.call(buffer.getBuffer()).slice(0, 12)
                ).toEqual([ -41, 8, -39, 0, -35, 3, -33, 9, -28, 8, -27, 11]);
                expect(buffer.getLength()).toEqual(6);
            });

            it("finds insertion indexes", function () {
                expect(buffer.findInsertionIndex(0)).toEqual(0);
                expect(buffer.findInsertionIndex(2)).toEqual(1);
                expect(buffer.findInsertionIndex(5)).toEqual(2);
                expect(buffer.findInsertionIndex(10)).toEqual(4);
                expect(buffer.findInsertionIndex(14.5)).toEqual(5);
                expect(buffer.findInsertionIndex(20)).toEqual(6);

                // 9 is already in there, disallow insertion
                expect(buffer.findInsertionIndex(9)).toEqual(-1);
            });

            it("allows insertion in the middle", function () {
                var head = [ -41, 8, -39, 0, -35, 3 ],
                    tail = [ -33, 9, -28, 8, -27, 11];
                buffer.insert(mockSeries, 3);
                expect(
                    Array.prototype.slice.call(buffer.getBuffer()).slice(0, 24)
                ).toEqual(head.concat(head).concat(tail).concat(tail));
                expect(buffer.getLength()).toEqual(12);
            });

            it("allows values to be trimmed from the start", function () {
                buffer.trim(2);
                expect(buffer.getLength()).toEqual(4);
                expect(
                    Array.prototype.slice.call(buffer.getBuffer()).slice(0, 8)
                ).toEqual([ -35, 3, -33, 9, -28, 8, -27, 11]);
            });

            it("ensures a maximum size", function () {
                var i;

                // Should be able to insert 6 series of 6 points each
                // (After that, we'll hit the test max of 40)
                for (i = 1; i < 6; i += 1) {
                    expect(buffer.getLength()).toEqual(6 * i);
                    expect(buffer.insert(mockSeries, Number.POSITIVE_INFINITY))
                        .toBeTruthy();
                }

                // Should be maxed out now
                expect(buffer.getLength()).toEqual(36);
                expect(buffer.insert(mockSeries, Number.POSITIVE_INFINITY))
                    .toBeFalsy();
                expect(buffer.getLength()).toEqual(36);

            });

            it("reduces buffer size when space is no longer needed", function () {
                // Check that actual buffer is sized to the initial size
                // (double TEST_INITIAL_SIZE, since two elements are needed per
                // point; one for domain, one for range)
                expect(buffer.getBuffer().length).toEqual(20);
                // Should have 6 elements now... grow to 24
                buffer.insert(mockSeries, Number.POSITIVE_INFINITY);
                buffer.insert(mockSeries, Number.POSITIVE_INFINITY);
                buffer.insert(mockSeries, Number.POSITIVE_INFINITY);
                // This should have doubled the actual buffer size
                expect(buffer.getBuffer().length).toEqual(80);
                // Remove some values
                buffer.trim(20);
                // Actual buffer size should have been reduced accordingly
                expect(buffer.getBuffer().length).toBeLessThan(80);
            });

        });
    }
);