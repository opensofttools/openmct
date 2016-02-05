/*****************************************************************************
 * Open MCT Web, Copyright (c) 2014-2015, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT Web is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT Web includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/
/*global define,describe,it,expect,beforeEach,waitsFor,jasmine*/

define(
    ["./ExportService", "csv"],
    function (ExportService, CSV) {
        'use strict';

        describe("ExportService", function () {
            var mockSaveAs,
                testRows,
                exportService;

            beforeEach(function () {
                testRows = [
                    { a: 1, b: 2, c: 3 },
                    { a: 4, b: 5, c: 6 },
                    { a: 7, b: 8, c: 9 }
                ];
                mockSaveAs = jasmine.createSpy('saveAs');
                exportService = new ExportService(mockSaveAs);
            });

            describe("#exportCSV(rows)", function () {
                beforeEach(function () {
                    exportService.exportCSV(testRows);
                });

                it("triggers saving of a file", function () {
                    expect(mockSaveAs).toHaveBeenCalledWith(
                        jasmine.any(Blob),
                        jasmine.any(String)
                    );
                });
            });

        });

    }
);